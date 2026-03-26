import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '16px'
};

const center = {
  lat: 40.7128,
  lng: -74.0060 // NYC default
};

const TrackingMap = ({ 
  donorLocation = { lat: 40.7128, lng: -74.0060 }, 
  ngoLocation = { lat: 40.7580, lng: -73.9855 },
  volunteerLocation = { lat: 40.7300, lng: -73.9950 },
  status = 'Assigned'
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE" // USER: Put your API key here
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (isLoaded && donorLocation && ngoLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: donorLocation,
          destination: ngoLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [isLoaded, donorLocation, ngoLocation]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={volunteerLocation || donorLocation}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Donor Marker */}
      <Marker 
        position={donorLocation} 
        label="D" 
        title="Donor Location"
      />
      
      {/* NGO Marker */}
      <Marker 
        position={ngoLocation} 
        label="N" 
        title="NGO Location"
      />

      {/* Volunteer Marker (Truck/Car) */}
      {(status === 'In Transit' || status === 'Assigned') && (
        <Marker 
          position={volunteerLocation} 
          icon={{
            url: "https://maps.google.com/mapfiles/kml/pal2/icon47.png", // Truck icon
            scaledSize: new window.google.maps.Size(40, 40)
          }}
          title="Volunteer Hero"
        />
      )}

      {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
    </GoogleMap>
  );
};

export default React.memo(TrackingMap);
