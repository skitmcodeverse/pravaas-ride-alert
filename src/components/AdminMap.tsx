
import React, { useState } from 'react';
import { Location } from '@/contexts/LocationContext';
import { MapPin, Bus, Users, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Driver {
  id: string;
  name: string;
  busId: string;
  status: 'active' | 'inactive';
  studentsCount: number;
}

interface Student {
  id: string;
  name: string;
  busId: string;
  homeLocation?: { lat: number; lng: number };
}

interface AdminMapProps {
  locations: Location[];
  drivers: Driver[];
  students: Student[];
}

const AdminMap: React.FC<AdminMapProps> = ({ locations, drivers, students }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  const activeBuses = drivers.filter(d => d.status === 'active');

  return (
    <div className="w-full h-full relative bg-slate-700">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="admin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-grid)" />
          </svg>
        </div>
      </div>

      {/* Bus Markers */}
      {activeBuses.map((driver, index) => {
        const location = locations.find(l => l.busId === driver.busId);
        const isSelected = selectedBus === driver.busId;
        
        // Position buses in a grid pattern for demo
        const x = 20 + (index % 3) * 25;
        const y = 20 + Math.floor(index / 3) * 30;
        
        return (
          <div
            key={driver.busId}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
              isSelected ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => setSelectedBus(isSelected ? null : driver.busId)}
          >
            <div className={`rounded-full p-3 shadow-lg ${
              location ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
            } ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}>
              <Bus className="w-6 h-6 text-white" />
            </div>
            
            <div className="text-xs text-white text-center mt-1 bg-black bg-opacity-70 rounded px-2 py-1">
              {driver.busId}
            </div>
            
            {isSelected && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-slate-800 rounded-lg p-3 text-white shadow-xl border border-slate-700 w-48">
                <h3 className="font-bold mb-2">{driver.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={driver.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}>
                      {driver.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span>{driver.studentsCount}</span>
                  </div>
                  {location && (
                    <div className="text-xs text-slate-400 mt-2">
                      Last seen: {new Date(location.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Student Home Locations */}
      {students.filter(s => s.homeLocation).map((student, index) => (
        <div
          key={student.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${15 + (index % 4) * 20}%`, 
            top: `${60 + Math.floor(index / 4) * 15}%` 
          }}
        >
          <div className="bg-blue-500 rounded-full p-1 shadow-lg">
            <Users className="w-3 h-3 text-white" />
          </div>
        </div>
      ))}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          onClick={handleZoomIn}
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 rounded-lg p-4 text-white text-sm space-y-3">
        <h3 className="font-bold text-yellow-400">LEGEND</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Active Bus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
            <span>Inactive Bus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Student Home</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-600">
          <div className="text-xs text-slate-400">
            Total Buses: {drivers.length}<br/>
            Active: {activeBuses.length}<br/>
            Students: {students.length}
          </div>
        </div>
      </div>

      {/* No Data Overlay */}
      {activeBuses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <Navigation className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold mb-2">No Active Buses</h3>
            <p className="text-slate-400">Waiting for drivers to start their routes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMap;
