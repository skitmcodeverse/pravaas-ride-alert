import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
} from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface BusLocation {
    id: string;
    bus_id: string;
    driver_id: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    is_active: boolean;
    timestamp: Date;
}

interface LocationContextType {
    busLocations: BusLocation[];
    currentLocation: GeolocationPosition | null;
    isTracking: boolean;
    isConnected: boolean;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
    getBusLocation: (busId: string) => BusLocation | null;
}

const LocationContext = createContext<LocationContextType | undefined>(
    undefined
);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { user } = useAuth();
    const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
    const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const watchIdRef = useRef<string | number | null>(null);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Real-time subscription for bus locations
    useEffect(() => {
        const channel = supabase
            .channel('bus_locations_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bus_locations'
                },
                (payload) => {
                    console.log('Bus location update:', payload);
                    fetchBusLocations();
                }
            )
            .subscribe();

        // Initial fetch
        fetchBusLocations();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchBusLocations = async () => {
        try {
            const { data, error } = await supabase
                .from('bus_locations')
                .select('*')
                .eq('is_active', true)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            // Group by bus_id and keep only the latest location for each bus
            const latestLocations = data?.reduce((acc: BusLocation[], curr) => {
                const existingIndex = acc.findIndex(loc => loc.bus_id === curr.bus_id);
                if (existingIndex === -1) {
                    acc.push({
                        ...curr,
                        timestamp: new Date(curr.timestamp)
                    });
                }
                return acc;
            }, []) || [];

            setBusLocations(latestLocations);
        } catch (error) {
            console.error('Error fetching bus locations:', error);
        }
    };

    const getBusLocation = useCallback((busId: string) => {
        return busLocations.find(loc => loc.bus_id === busId) || null;
    }, [busLocations]);

    const startTracking = useCallback(async () => {
        if (!user || user.role !== 'driver' || !user.busId) {
            console.error('Only drivers with assigned buses can start tracking');
            return;
        }

        try {
            const useCapacitor = Capacitor.isNativePlatform?.() || false;

            const handlePosition = async (position: GeolocationPosition | any) => {
                const geoPosition = position as GeolocationPosition;
                setCurrentLocation(geoPosition);
                setIsTracking(true);
                
                const { latitude, longitude } = geoPosition.coords;
                
                // Save to Supabase - first deactivate old locations for this bus
                await supabase
                    .from('bus_locations')
                    .update({ is_active: false })
                    .eq('bus_id', user.busId!)
                    .eq('driver_id', user.id);

                // Insert new location
                const { error } = await supabase
                    .from('bus_locations')
                    .insert({
                        bus_id: user.busId!,
                        driver_id: user.id,
                        latitude,
                        longitude,
                        speed: geoPosition.coords.speed || 0,
                        heading: geoPosition.coords.heading || 0,
                        is_active: true,
                        timestamp: new Date().toISOString(),
                    });

                if (error) {
                    console.error('Error saving location:', error);
                }
            };

            if (useCapacitor) {
                await Geolocation.requestPermissions();
                const id = await Geolocation.watchPosition(
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
            } else {
                if (!navigator.geolocation) {
                    throw new Error('Geolocation is not supported');
                }

                const id = navigator.geolocation.watchPosition(
                    handlePosition,
                    (error) => {
                        console.error('Location error:', error);
                        setIsConnected(false);
                    },
                    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
                );
                watchIdRef.current = id;
            }

            // Set up periodic updates every 5 seconds
            updateIntervalRef.current = setInterval(async () => {
                if (currentLocation) {
                    await handlePosition(currentLocation);
                }
            }, 5000);

            setIsConnected(true);
        } catch (error) {
            console.error('Error starting tracking:', error);
            setIsConnected(false);
        }
    }, [user, currentLocation]);

    const stopTracking = useCallback(async () => {
        if (!user || user.role !== 'driver' || !user.busId) {
            return;
        }

        try {
            const useCapacitor = Capacitor.isNativePlatform?.() || false;
            if (useCapacitor && watchIdRef.current) {
                await Geolocation.clearWatch({ id: String(watchIdRef.current) });
            } else if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current as number);
            }

            // Clear the update interval
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
                updateIntervalRef.current = null;
            }

            // Mark bus as inactive in database
            await supabase
                .from('bus_locations')
                .update({ is_active: false })
                .eq('bus_id', user.busId)
                .eq('driver_id', user.id);

        } catch (e) {
            console.error('Error stopping tracking:', e);
        }
        
        watchIdRef.current = null;
        setIsTracking(false);
        console.log('Tracking stopped');
    }, [user]);

    const value: LocationContextType = {
        busLocations,
        currentLocation,
        isTracking,
        isConnected,
        startTracking,
        stopTracking,
        getBusLocation,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};
