
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Location {
  id: string;
  busId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface LocationContextType {
  locations: Location[];
  currentLocation: GeolocationPosition | null;
  isTracking: boolean;
  isConnected: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  updateLocation: (location: Location) => void;
  sendLocationUpdate: (busId: string, lat: number, lng: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected] = useState(true); // Always connected for simplicity

  const updateLocation = useCallback((location: Location) => {
    setLocations(prev => {
      const filtered = prev.filter(l => l.busId !== location.busId);
      return [...filtered, location];
    });
  }, []);

  const sendLocationUpdate = useCallback((busId: string, lat: number, lng: number) => {
    console.log('Location update sent:', { busId, lat, lng });
    
    const newLocation: Location = {
      id: `${busId}-${Date.now()}`,
      busId,
      latitude: lat,
      longitude: lng,
      timestamp: new Date(),
      speed: 0,
      heading: 0
    };
    
    updateLocation(newLocation);
  }, [updateLocation]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position);
        setIsTracking(true);
        console.log('Tracking started:', position.coords);
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    console.log('Tracking stopped');
  }, []);

  const value: LocationContextType = {
    locations,
    currentLocation,
    isTracking,
    isConnected,
    startTracking,
    stopTracking,
    updateLocation,
    sendLocationUpdate
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
