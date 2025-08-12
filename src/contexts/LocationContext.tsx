
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

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
  const watchIdRef = useRef<string | number | null>(null);

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
    const useCapacitor = Capacitor.isNativePlatform?.() || false;

    const handlePosition = (position: any) => {
      setCurrentLocation(position as GeolocationPosition);
      setIsTracking(true);
      console.log('Tracking update:', position?.coords);
    };

    if (useCapacitor) {
      Geolocation.requestPermissions()
        .then(() => {
          const id = Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: 10000 },
            (position, err) => {
              if (err) {
                console.error('Capacitor geolocation error:', err);
                return;
              }
              if (position) handlePosition(position);
            }
          );
          watchIdRef.current = id as unknown as string;
        })
        .catch((e) => {
          console.error('Permission error:', e);
        });
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        handlePosition(position);
      },
      (error) => {
        console.error('Location error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    watchIdRef.current = id;
  }, []);

  const stopTracking = useCallback(() => {
    try {
      const useCapacitor = Capacitor.isNativePlatform?.() || false;
      if (useCapacitor && watchIdRef.current) {
        Geolocation.clearWatch({ id: String(watchIdRef.current) });
      } else if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current as number);
      }
    } catch (e) {
      console.error('Error stopping tracking:', e);
    }
    watchIdRef.current = null;
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
