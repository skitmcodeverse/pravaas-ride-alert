
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Navigation, 
  LogOut, 
  MapPin, 
  Users, 
  Clock, 
  Play, 
  Square,
  Wifi,
  WifiOff
} from 'lucide-react';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const { isTracking, isConnected, currentLocation, startTracking, stopTracking, sendLocationUpdate } = useLocation();
  const [trackingDuration, setTrackingDuration] = useState(0);
  const [studentCount] = useState(8); // Mock data

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking) {
      interval = setInterval(() => {
        setTrackingDuration(prev => prev + 1);
        
        // Send location update every 15 seconds when tracking
        if (currentLocation && user?.busId) {
          sendLocationUpdate(
            user.busId,
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
        }
      }, 1000);
    } else {
      setTrackingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentLocation, user?.busId, sendLocationUpdate]);

  const handleStartTracking = async () => {
    try {
      // Request permissions first
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      if (permission.state === 'denied') {
        toast({
          title: "LOCATION PERMISSION REQUIRED",
          description: "Please enable location access to start tracking",
          variant: "destructive",
        });
        return;
      }

      startTracking();
      
      toast({
        title: "TRACKING STARTED",
        description: "Students can now see your bus location",
      });
    } catch (error) {
      toast({
        title: "TRACKING FAILED",
        description: "Could not start location tracking",
        variant: "destructive",
      });
    }
  };

  const handleStopTracking = () => {
    stopTracking();
    toast({
      title: "TRACKING STOPPED",
      description: "Location sharing has been disabled",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
              <h1 className="text-xl font-bold">DRIVER PORTAL</h1>
              <p className="text-slate-400 text-sm">{user?.name} • Bus {user?.busId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm text-slate-400">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Tracking Control */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {!isTracking ? (
                <>
                  <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-12 h-12 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">START TRACKING</h2>
                    <p className="text-slate-400 text-lg">Let students know where you are</p>
                  </div>
                  <Button
                    onClick={handleStartTracking}
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xl px-12 py-4 h-auto"
                  >
                    BEGIN ROUTE
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Square className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-red-400">TRACKING ACTIVE</h2>
                    <p className="text-slate-400 text-lg">Students can see your location</p>
                  </div>
                  <div className="text-4xl font-mono font-bold text-yellow-400">
                    {formatDuration(trackingDuration)}
                  </div>
                  <Button
                    onClick={handleStopTracking}
                    size="lg"
                    variant="destructive"
                    className="font-bold text-xl px-12 py-4 h-auto"
                  >
                    STOP TRACKING
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                LOCATION STATUS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={isTracking ? "bg-green-500" : "bg-slate-500"}>
                  {isTracking ? "LIVE" : "OFFLINE"}
                </Badge>
                {currentLocation && (
                  <div className="text-xs text-slate-400">
                    Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                STUDENTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentCount}</div>
              <div className="text-xs text-slate-400">Assigned to your route</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                SESSION TIME
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {formatDuration(trackingDuration)}
              </div>
              <div className="text-xs text-slate-400">Current session</div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {!isTracking && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">QUICK START GUIDE</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="bg-yellow-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span>Tap "BEGIN ROUTE" to start location tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-yellow-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span>Students will receive real-time updates of your location</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-yellow-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span>Tap "STOP TRACKING" when your route is complete</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
