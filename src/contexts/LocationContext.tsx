
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    throw new error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    try {
      // In a real app, this would be your WebSocket server endpoint
      // For now, we'll simulate WebSocket functionality
      const mockWs = {
        send: (data: string) => {
          console.log('Mock WebSocket sending:', data);
          // Simulate receiving location updates from other buses
          setTimeout(() => {
            const mockUpdate: Location = {
              id: `mock-${Date.now()}`,
              busId: 'BUS-002',
              latitude: 40.7589 + (Math.random() - 0.5) * 0.01,
              longitude: -73.9851 + (Math.random() - 0.5) * 0.01,
              timestamp: new Date(),
              speed: Math.random() * 50,
              heading: Math.random() * 360
            };
            
            setLocations(prev => {
              const filtered = prev.filter(l => l.busId !== mockUpdate.busId);
              return [...filtered, mockUpdate];
            });
          }, 2000);
        },
        close: () => {
          console.log('Mock WebSocket closed');
        }
      } as any;

      setWs(mockWs);
      setIsConnected(true);
      
      console.log('Mock WebSocket connected for real-time location updates');
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
      setIsConnected(false);
    }
  }, [ws]);

  // Send location update via WebSocket
  const sendLocationUpdate = useCallback((busId: string, lat: number, lng: number) => {
    if (ws && isConnected) {
      const locationData = {
        type: 'location_update',
        busId,
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
        speed: currentLocation?.coords.speed || 0,
        heading: currentLocation?.coords.heading || 0
      };
      
      ws.send(JSON.stringify(locationData));
      console.log('Location update sent:', locationData);
      
      // Also update local state
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
  }, [ws, isConnected, currentLocation]);

  const startTracking = () => {
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
        
        // Auto-send location updates every 15 seconds when tracking
        // This would typically be done by the driver's device
      },
      (error) => {
        console.error('Location error:', error);
      },
      options
    );

    setWatchId(id);
    setIsTracking(true);
    
    // Connect to WebSocket when starting tracking
    if (!isConnected) {
      connectWebSocket();
    }
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    
    // Disconnect WebSocket when stopping tracking
    disconnectWebSocket();
  };

  const updateLocation = (location: Location) => {
    setLocations(prev => {
      const filtered = prev.filter(l => l.busId !== location.busId);
      return [...filtered, location];
    });
  };

  // Initialize WebSocket connection on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      disconnectWebSocket();
    };
  }, [watchId, disconnectWebSocket]);

  // Simulate receiving periodic location updates for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        // Simulate other buses moving around
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
      }
    }, 10000); // Update every 10 seconds for demo

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <LocationContext.Provider value={{
      locations,
      currentLocation,
      isTracking,
      isConnected,
      startTracking,
      stopTracking,
      updateLocation,
      sendLocationUpdate
    }}>
      {children}
    </LocationContext.Provider>
  );
};
