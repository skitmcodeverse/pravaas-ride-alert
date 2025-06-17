
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Home, Navigation } from 'lucide-react';

interface LiveMapProps {
  userLocation: { lat: number; lng: number } | null;
  busLocation: { lat: number; lng: number } | null;
  busId: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ userLocation, busLocation, busId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  useEffect(() => {
    if (busLocation) {
      setMapCenter(busLocation);
    } else if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [busLocation, userLocation]);

  // This is a placeholder map implementation
  // In a real app, you would integrate with a mapping library like Leaflet or Google Maps
  return (
    <div ref={mapRef} className="w-full h-full bg-slate-700 rounded-lg relative overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Home Location Marker */}
      {userLocation && (
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ 
            left: '30%', 
            top: '70%' 
          }}
        >
          <div className="bg-blue-500 rounded-full p-2 shadow-lg animate-pulse">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs text-white text-center mt-1 bg-black bg-opacity-50 rounded px-2 py-1">
            HOME
          </div>
        </div>
      )}

      {/* Bus Location Marker */}
      {busLocation && (
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 animate-bounce"
          style={{ 
            left: '60%', 
            top: '40%' 
          }}
        >
          <div className="bg-yellow-400 rounded-full p-3 shadow-lg">
            <Navigation className="w-8 h-8 text-slate-900" />
          </div>
          <div className="text-xs text-white text-center mt-1 bg-black bg-opacity-50 rounded px-2 py-1">
            BUS {busId}
          </div>
        </div>
      )}

      {/* Route Line (simulated) */}
      {userLocation && busLocation && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="30%"
            y1="70%"
            x2="60%"
            y2="40%"
            stroke="#FFD700"
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        </svg>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded shadow-lg">
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded p-3 text-white text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span>Your Bus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Your Home</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-yellow-400"></div>
          <span>Route</span>
        </div>
      </div>

      {/* No Data Overlay */}
      {!busLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
