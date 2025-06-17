
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
  const [isConnected, setIsConnected] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);
  const wsRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simple update location function
  const updateLocation = useCallback((location: Location) => {
    setLocations(prev => {
      const filtered = prev.filter(l => l.busId !== location.busId);
      return [...filtered, location];
    });
  }, []);

  // Simple send location update
  const sendLocationUpdate = useCallback((busId: string, lat: number, lng: number) => {
    if (wsRef.current && isConnected) {
      const locationData = {
        type: 'location_update',
        busId,
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
        speed: currentLocation?.coords.speed || 0,
        heading: currentLocation?.coords.heading || 0
      };
      
      wsRef.current.send(JSON.stringify(locationData));
      console.log('Location update sent:', locationData);
      
      const newLocation: Location = {
        id: `${busId}-${Date.now()}`,
        busId,
        latitude: lat,
        longitude: lng,
        timestamp: new Date(),
        speed: locationData.speed,
        heading: locationData.heading
      };
      
      updateLocation(newLocation);
    }
  }, [isConnected, currentLocation, updateLocation]);

  // Simple WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) return;

    try {
      const mockWs = {
        send: (data: string) => {
          console.log('Mock WebSocket sending:', data);
        },
        close: () => {
          console.log('Mock WebSocket closed');
        }
      };

      wsRef.current = mockWs;
      setIsConnected(true);
      console.log('Mock WebSocket connected');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
        console.log('Location updated:', position.coords);
      },
      (error) => {
        console.error('Location error:', error);
      },
      options
    );

    watchIdRef.current = id;
    setIsTracking(true);
    
    if (!wsRef.current) {
      connectWebSocket();
    }
  }, [connectWebSocket]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    disconnectWebSocket();
  }, [disconnectWebSocket]);

  // Initialize WebSocket once
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  // Demo location updates
  useEffect(() => {
    if (!isConnected) return;

    intervalRef.current = setInterval(() => {
      const demoBuses = ['BUS-001', 'BUS-003', 'BUS-004'];
      const randomBus = demoBuses[Math.floor(Math.random() * demoBuses.length)];
      
      const mockLocation: Location = {
        id: `demo-${randomBus}-${Date.now()}`,
        busId: randomBus,
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        timestamp: new Date(),
        speed: Math.random() * 30,
        heading: Math.random() * 360
      };
      
      setLocations(prev => {
        const filtered = prev.filter(l => l.busId !== mockLocation.busId);
        return [...filtered, mockLocation];
      });
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Static context value object
  const contextValue: LocationContextType = {
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
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
