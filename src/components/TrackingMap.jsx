import React, { useEffect, useRef, useState } from 'react';
import MapComponent from './MapComponent';

/**
 * TrackingMap — always routes Volunteer → Donor.
 *
 * Priority for volunteer start point:
 *  1. Live GPS position (obtained here via navigator.geolocation)
 *  2. volunteerLocation from the DB (set by watchPosition in VolunteerDashboard)
 *  3. donorLocation as fallback center (no route drawn until we have volunteer coords)
 */
const TrackingMap = ({
  donorLocation,          // [lng, lat] – donor / pickup point
  volunteerLocation,      // [lng, lat] – last saved volunteer coords from DB
  status = 'Assigned',
  onRouteInfo = null
}) => {
  const [liveCoords, setLiveCoords] = useState(null);  // real-time GPS
  const watchIdRef = useRef(null);

  // Start watching the volunteer's GPS while this component is mounted
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveCoords([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {
        // GPS denied / unavailable – fall back to DB coords (handled below)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Best available volunteer position: live GPS > DB saved > null
  const volunteerCoords =
    liveCoords ||
    (volunteerLocation && volunteerLocation[0] !== 0 ? volunteerLocation : null);

  // --- Markers ---
  // Donor marker always present
  const donorMarker = donorLocation
    ? {
        coordinates: donorLocation,
        title: 'Donor Location',
        subtitle: 'Pickup point',
        color: '#198754'
      }
    : null;

  // Volunteer marker when we have coords
  const volunteerMarker = volunteerCoords
    ? {
        coordinates: volunteerCoords,
        title: 'You (Volunteer)',
        subtitle: status === 'In Transit' ? 'En route to donor' : 'Heading to pickup',
        color: '#dc3545'
      }
    : null;

  const allMarkers = [donorMarker, volunteerMarker].filter(Boolean);

  // Route: Volunteer → Donor (only when both are known)
  const routeMarkers =
    volunteerCoords && donorLocation
      ? [
          { coordinates: volunteerCoords, title: 'You (Volunteer)', color: '#dc3545' },
          { coordinates: donorLocation,   title: 'Donor Location',  color: '#198754' }
        ]
      : [];

  // Map center: volunteer if known, else donor, else default
  const center =
    volunteerCoords || donorLocation || [78.146, 11.664];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      <MapComponent
        center={center}
        zoom={14}
        markers={allMarkers}
        routeMarkers={routeMarkers}
        onRouteUpdate={onRouteInfo}
        interactive={true}
      />

      {/* Live GPS indicator badge */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: liveCoords ? 'rgba(25, 135, 84, 0.92)' : 'rgba(108,117,125,0.88)',
          color: '#fff',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: liveCoords ? '#7effc0' : '#ccc', display: 'inline-block', boxShadow: liveCoords ? '0 0 5px #7effc0' : 'none' }} />
        {liveCoords ? 'GPS Live' : volunteerCoords ? 'Last Known' : 'Locating…'}
      </div>
    </div>
  );
};

export default React.memo(TrackingMap);
