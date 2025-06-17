
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Home } from 'lucide-react';

interface LocationPickerProps {
  onLocationSet: (lat: number, lng: number) => void;
  onCancel: () => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSet, onCancel }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click position to mock coordinates
    const lat = 40.7128 + (0.5 - y / rect.height) * 0.1;
    const lng = -74.0060 + (x / rect.width - 0.5) * 0.1;
    
    setSelectedLocation({ lat, lng });
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          // Fallback to mock location
          setSelectedLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      setIsGettingLocation(false);
      setSelectedLocation({ lat: 40.7128, lng: -74.0060 });
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSet(selectedLocation.lat, selectedLocation.lng);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Home className="w-6 h-6 text-yellow-400" />
            SET HOME LOCATION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-400 text-center">
            We need your home location to calculate accurate arrival times for your bus.
          </p>

          {/* Mock Map */}
          <div 
            className="h-64 bg-slate-700 rounded-lg relative cursor-crosshair overflow-hidden"
            onClick={handleMapClick}
          >
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="picker-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#picker-grid)" />
                </svg>
              </div>
            </div>

            {/* Selected Location Marker */}
            {selectedLocation && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce">
                  <Home className="w-6 h-6 text-slate-900" />
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-white bg-black bg-opacity-50 rounded p-4">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm">
                  {selectedLocation ? 'Location Selected!' : 'Tap on the map to set your home'}
                </p>
              </div>
            </div>
          </div>

          {/* Location Buttons */}
          <div className="space-y-3">
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
            </Button>

            {selectedLocation && (
              <div className="text-center text-sm text-slate-400">
                Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold"
            >
              Confirm Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPicker;
