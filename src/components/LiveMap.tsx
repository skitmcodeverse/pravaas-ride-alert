
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { MapPin, Home, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Webpack
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon issue
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom icons
const busIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 6v6"/>
      <path d="M15 6v6"/>
      <path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2L20.6 10H3.4L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2L3 18h3"/>
      <circle cx="7" cy="18" r="2"/>
      <circle cx="17" cy="18" r="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const homeIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

interface LiveMapProps {
  userLocation: { lat: number; lng: number } | null;
  busLocation: { lat: number; lng: number } | null;
  busId: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ userLocation, busLocation, busId }) => {
  const mapRef = useRef<any>(null);
  
  // Default center (NYC)
  const defaultCenter: LatLngExpression = [40.7128, -74.0060];
  
  // Determine map center
  const mapCenter: LatLngExpression = busLocation 
    ? [busLocation.lat, busLocation.lng]
    : userLocation 
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  // Create route line if both locations exist
  const routePositions: LatLngExpression[] = 
    userLocation && busLocation 
      ? [[userLocation.lat, userLocation.lng], [busLocation.lat, busLocation.lng]]
      : [];

  useEffect(() => {
    // Auto-fit bounds when both locations are available
    if (mapRef.current && userLocation && busLocation) {
      const map = mapRef.current;
      const bounds = [
        [userLocation.lat, userLocation.lng],
        [busLocation.lat, busLocation.lng]
      ] as LatLngExpression[];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, busLocation]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User Home Location */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={homeIcon}
          >
            <Popup>
              <div className="text-center">
                <Home className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <strong>Your Home</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Bus Location */}
        {busLocation && (
          <Marker 
            position={[busLocation.lat, busLocation.lng]} 
            icon={busIcon}
          >
            <Popup>
              <div className="text-center">
                <Navigation className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                <strong>Bus {busId}</strong>
                <br />
                <small>Live Location</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {routePositions.length > 0 && (
          <Polyline 
            positions={routePositions}
            color="#FFD700"
            weight={3}
            dashArray="5, 10"
            opacity={0.8}
          />
        )}
      </MapContainer>

      {/* No Data Overlay */}
      {!busLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-center text-white">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <h3 className="text-lg font-bold mb-1">Waiting for Bus</h3>
            <p className="text-slate-400">Driver hasn't started tracking yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
