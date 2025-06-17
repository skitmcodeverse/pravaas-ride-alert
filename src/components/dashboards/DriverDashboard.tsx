
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Navigation, Users, Clock, LogOut, MapPin, Play, Square } from 'lucide-react';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const { isTracking, startTracking, stopTracking, currentLocation } = useLocation();
  const [tripDuration, setTripDuration] = useState(0);
  const [studentsOnBoard, setStudentsOnBoard] = useState(12);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setTripDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStartTracking = async () => {
    try {
      startTracking();
      toast({
        title: "TRACKING STARTED",
        description: "Location sharing is now active",
      });
    } catch (error) {
      toast({
        title: "Permission Required",
        description: "Please allow location access to start tracking",
        variant: "destructive",
      });
    }
  };

  const handleStopTracking = () => {
    stopTracking();
    setTripDuration(0);
    toast({
      title: "TRACKING STOPPED",
      description: "Location sharing has been disabled",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
              <h1 className="text-xl font-bold">DRIVER CONTROL</h1>
              <p className="text-slate-400 text-sm">{user?.name} • Bus {user?.busId}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Tracking Control */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {!isTracking ? (
                <>
                  <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-12 h-12 text-slate-900" />
                  </div>
                  <h2 className="text-2xl font-bold">START TRACKING</h2>
                  <p className="text-slate-400">Tap to begin location sharing</p>
                  <Button 
                    onClick={handleStartTracking}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-lg px-8 py-3"
                    size="lg"
                  >
                    START ROUTE
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-400">TRACKING ACTIVE</h2>
                  <p className="text-slate-400">Students can see your location</p>
                  <div className="text-3xl font-mono font-bold text-yellow-400">
                    {formatTime(tripDuration)}
                  </div>
                  <Button 
                    onClick={handleStopTracking}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-8 py-3"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    END ROUTE
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                STUDENTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsOnBoard}</div>
              <p className="text-slate-400 text-sm">On board</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                STATUS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={isTracking ? "bg-green-500" : "bg-slate-600"}>
                {isTracking ? "ACTIVE" : "INACTIVE"}
              </Badge>
              <p className="text-slate-400 text-sm mt-1">Tracking status</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Location Info */}
        {currentLocation && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm">CURRENT LOCATION</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-400 space-y-1">
                <div>Lat: {currentLocation.coords.latitude.toFixed(6)}</div>
                <div>Lng: {currentLocation.coords.longitude.toFixed(6)}</div>
                <div>Accuracy: {currentLocation.coords.accuracy?.toFixed(0)}m</div>
                {currentLocation.coords.speed && (
                  <div>Speed: {(currentLocation.coords.speed * 3.6).toFixed(1)} km/h</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
