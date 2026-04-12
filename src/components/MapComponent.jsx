import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = ({
  center = [78.1460, 11.6643], // Colombo, Sri Lanka default
  zoom = 12,
  onLocationSelect = null,
  markers = [],
  interactive = true
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const apiKey = 'VD2Y35yBCuhMl7EazZ7u';

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
      el.className = 'custom-marker';
      el.style.backgroundColor = mark.color || "#0d6efd";
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

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

    // Draw a simple route if there are exactly 2 markers (Volunteer and Destination)
    const drawRoute = () => {
      if (markers.length === 2) {
        const coords = markers.map(m => m.coordinates);
        
        if (map.current.getSource(routeSourceId)) {
          map.current.getSource(routeSourceId).setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          });
        } else {
          map.current.addSource(routeSourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coords
              }
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
              'line-width': 4,
              'line-dasharray': [2, 2]
            }
          });
        }
      }
    };

    if (map.current.isStyleLoaded()) {
      drawRoute();
    } else {
      map.current.once('load', drawRoute);
    }
  }, [markers]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '15px' }} />
  );
};

export default MapComponent;
