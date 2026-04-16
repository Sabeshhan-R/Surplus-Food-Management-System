import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = ({
  center = [78.1460, 11.6643], 
  zoom = 12,
  onLocationSelect = null,
  markers = [],
  routeMarkers = [],
  onRouteUpdate = null,
  interactive = true
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

  useEffect(() => {
    if (map.current) return; // Initialize only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
      center: center,
      zoom: zoom,
      interactive: interactive
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    if (onLocationSelect && interactive) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          markerRef.current = new maplibregl.Marker({ draggable: true, color: "#198754" })
            .setLngLat([lng, lat])
            .addTo(map.current);

          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLngLat();
            onLocationSelect([pos.lng, pos.lat]);
          });
        }

        onLocationSelect([lng, lat]);
      });
    }
  }, [apiKey]);

  // Update center when it changes
  useEffect(() => {
    if (map.current && center) {
      map.current.flyTo({
        center: center,
        essential: true,
        speed: 1.2,
        zoom: zoom || map.current.getZoom()
      });
    }
  }, [center]);

  const activeMarkers = useRef([]);
  const routeLayerId = 'route-layer';
  const routeSourceId = 'route-source';

  // Add multiple markers if provided
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    activeMarkers.current.forEach(m => m.remove());
    activeMarkers.current = [];

    markers.forEach(mark => {
      const el = document.createElement('div');
      el.className = `custom-marker ${mark.title !== 'Volunteer Hero' ? 'pulse-marker' : ''}`;
      el.style.backgroundColor = mark.color || "#0d6efd";
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      
      if (mark.title === 'Volunteer Hero') {
         el.innerHTML = '🚚';
         el.style.fontSize = '12px';
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(mark.coordinates)
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 10px; font-family: 'Outfit';">
            <h6 style="margin: 0; font-weight: 700;">${mark.title || 'Location'}</h6>
            ${mark.subtitle ? `<p style="margin: 5px 0 0; font-size: 12px; color: #666;">${mark.subtitle}</p>` : ''}
          </div>
        `))
        .addTo(map.current);

      activeMarkers.current.push(marker);
    });

    // Draw a road route using OSRM Routing API (Free & Works with MapTiler)
    const drawRoute = async () => {
      const activeRouteMarkers = routeMarkers.length > 0 ? routeMarkers : (markers.length === 2 ? markers : []);
      
      if (activeRouteMarkers.length >= 2) {
        // OSRM expects coordinates in lng,lat;lng,lat format
        const coordsStr = activeRouteMarkers.map(m => `${m.coordinates[0]},${m.coordinates[1]}`).join(';');
        
        try {
          // Using public OSRM for directions
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`);
          const data = await response.json();
          
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const geometry = route.geometry;
            
            if (onRouteUpdate) {
              onRouteUpdate({
                distance: route.distance, // meters
                duration: route.duration   // seconds
              });
            }
            
            if (map.current.getSource(routeSourceId)) {
                map.current.getSource(routeSourceId).setData({
                  type: 'Feature',
                  properties: {},
                  geometry: geometry
                });
            } else {
                map.current.addSource(routeSourceId, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    properties: {},
                    geometry: geometry
                  }
                });

                map.current.addLayer({
                  id: routeLayerId,
                  type: 'line',
                  source: routeSourceId,
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  paint: {
                    'line-color': '#0d6efd',
                    'line-width': 6,
                    'line-opacity': 0.8
                  }
                });

                // Add a dashed casing for premium look
                map.current.addLayer({
                  id: routeLayerId + '-casing',
                  type: 'line',
                  source: routeSourceId,
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  paint: {
                    'line-color': '#ffffff',
                    'line-width': 2,
                    'line-dasharray': [2, 2]
                  }
                });
            }
          }
        } catch (err) {
          // Fallback to straight line
          const coords = activeRouteMarkers.map(m => m.coordinates);
          if (map.current.getSource(routeSourceId)) {
            map.current.getSource(routeSourceId).setData({
                  type: 'Feature',
                  properties: {},
                  geometry: { type: 'LineString', coordinates: coords }
            });
          }
        }
      } else if (map.current.getSource(routeSourceId)) {
        map.current.getSource(routeSourceId).setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      drawRoute();
    } else {
      map.current.once('load', drawRoute);
    }
  }, [markers, routeMarkers]);

  return (
    <>
      <style>{`
        @keyframes custom-pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .pulse-marker {
          animation: custom-pulse 2s infinite;
        }
      `}</style>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '15px' }} />
    </>
  );
};

export default MapComponent;
