import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
    MapPin,
    Clock,
    Navigation,
    LogOut,
    Home,
    Bell,
    Map,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import LocationPicker from "@/components/LocationPicker";

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const { locations } = useLocation();
    const [homeLocation, setHomeLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [eta, setEta] = useState<number | null>(null);
    const [busLocation, setBusLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    useEffect(() => {
        // Load saved home location
        const saved = localStorage.getItem("student_home_location");
        if (saved) {
            setHomeLocation(JSON.parse(saved));
        } else {
            setShowLocationPicker(true);
        }
    }, []);

    useEffect(() => {
        // Find current bus location
        const myBusLocation = locations.find(
            (loc) => loc.busId === user?.busId
        );
        if (myBusLocation) {
            setBusLocation({
                lat: myBusLocation.latitude,
                lng: myBusLocation.longitude,
            });

            // Calculate ETA (mock calculation)
            if (homeLocation) {
                const distance = calculateDistance(
                    myBusLocation.latitude,
                    myBusLocation.longitude,
                    homeLocation.lat,
                    homeLocation.lng
                );
                const avgSpeed = 30; // km/h
                const etaMinutes = Math.round((distance / avgSpeed) * 60);
                setEta(etaMinutes);

                // Show notification if bus is close
                if (etaMinutes <= 10 && etaMinutes > 0) {
                    toast({
                        title: "BUS APPROACHING!",
                        description: `Your bus will arrive in ${etaMinutes} minutes`,
                    });
                }
            }
        }
    }, [locations, user?.busId, homeLocation]);

    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleSetHomeLocation = (lat: number, lng: number) => {
        const location = { lat, lng };
        setHomeLocation(location);
        localStorage.setItem("student_home_location", JSON.stringify(location));
        setShowLocationPicker(false);
        toast({
            title: "HOME LOCATION SET",
            description: "We'll track your bus arrival time",
        });
    };

    if (showLocationPicker) {
        return (
            <LocationPicker
                onLocationSet={handleSetHomeLocation}
                onCancel={() => setShowLocationPicker(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Navigation className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                MY BUS TRACKER
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {user?.name} • Bus {user?.busId}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowLocationPicker(true)}
                            className="text-slate-400 hover:text-white"
                        >
                            <Home className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={logout}
                            className="text-slate-400 hover:text-white"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* ETA Card */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="text-center space-y-3">
                            {eta !== null ? (
                                <>
                                    <Bell className="w-12 h-12 text-yellow-400 mx-auto" />
                                    <h2 className="text-2xl font-bold">
                                        ETA: {eta} MINUTES
                                    </h2>
                                    <p className="text-slate-400">
                                        Your bus is on the way!
                                    </p>
                                    <Badge
                                        className={
                                            eta <= 10
                                                ? "bg-red-500"
                                                : eta <= 20
                                                ? "bg-yellow-500"
                                                : "bg-green-500"
                                        }
                                    >
                                        {eta <= 10
                                            ? "ARRIVING SOON"
                                            : eta <= 20
                                            ? "GETTING CLOSE"
                                            : "ON TIME"}
                                    </Badge>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-12 h-12 text-slate-400 mx-auto" />
                                    <h2 className="text-xl font-bold text-slate-400">
                                        BUS NOT ACTIVE
                                    </h2>
                                    <p className="text-slate-400">
                                        Waiting for driver to start route
                                    </p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Live Map */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Map className="w-4 h-4 text-yellow-400" />
                            LIVE TRACKING
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-96 relative">
                            <LiveMap
                                userLocation={homeLocation}
                                busLocation={busLocation}
                                busId={user?.busId || ""}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4 text-center">
                            <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <div className="text-lg font-bold">
                                {eta || "--"}
                            </div>
                            <div className="text-xs text-slate-400">
                                Minutes
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4 text-center">
                            <MapPin className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <div className="text-lg font-bold">
                                {busLocation ? "LIVE" : "OFFLINE"}
                            </div>
                            <div className="text-xs text-slate-400">Status</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4 text-center">
                            <Navigation className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <div className="text-lg font-bold">
                                {user?.busId}
                            </div>
                            <div className="text-xs text-slate-400">Bus ID</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
