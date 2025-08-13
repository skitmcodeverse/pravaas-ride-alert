
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { BusLocation } from '@/contexts/LocationContext';
import { Bus, Users, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Custom icons for different bus states
const activeBusIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 6v6"/>
      <path d="M15 6v6"/>
      <path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2L20.6 10H3.4L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2L3 18h3"/>
      <circle cx="7" cy="18" r="2"/>
      <circle cx="17" cy="18" r="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const inactiveBusIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 6v6"/>
      <path d="M15 6v6"/>
      <path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2L20.6 10H3.4L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2L3 18h3"/>
      <circle cx="7" cy="18" r="2"/>
      <circle cx="17" cy="18" r="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const studentIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
});

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
  locations: BusLocation[];
  drivers: Driver[];
  students: Student[];
}

const AdminMap: React.FC<AdminMapProps> = ({ locations, drivers, students }) => {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  
  // Default center (User's area in India)
  const defaultCenter: LatLngExpression = [22.736995, 75.919283];
  
  // Generate demo positions for buses (in a real app, these would come from the locations prop)
  const getBusPosition = (busId: string, index: number): LatLngExpression => {
    const location = locations.find(l => l.bus_id === busId);
    if (location) {
      return [location.latitude, location.longitude];
    }
    
    // Demo positions around the user's area
    const demoPositions: LatLngExpression[] = [
      [22.7369, 75.9193], // Base position
      [22.7400, 75.9220], // North
      [22.7340, 75.9160], // South
      [22.7380, 75.9250], // East
      [22.7360, 75.9130], // West
    ];
    
    return demoPositions[index % demoPositions.length];
  };

  // Generate demo positions for student homes
  const getStudentPosition = (studentId: string, index: number): LatLngExpression => {
    const student = students.find(s => s.id === studentId);
    if (student?.homeLocation) {
      return [student.homeLocation.lat, student.homeLocation.lng];
    }
    
    // Demo positions around the user's area
    const demoPositions: LatLngExpression[] = [
      [22.7400, 75.9220], // North of base
      [22.7340, 75.9160], // South of base
      [22.7380, 75.9250], // East of base
      [22.7320, 75.9100], // Southwest
      [22.7420, 75.9280], // Northeast
    ];
    
    return demoPositions[index % demoPositions.length];
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Bus Markers */}
        {drivers.map((driver, index) => {
          const position = getBusPosition(driver.busId, index);
          const location = locations.find(l => l.bus_id === driver.busId);
          const isActive = driver.status === 'active' && location;
          
          return (
            <Marker
              key={driver.busId}
              position={position}
              icon={isActive ? activeBusIcon : inactiveBusIcon}
              eventHandlers={{
                click: () => setSelectedBus(selectedBus === driver.busId ? null : driver.busId)
              }}
            >
              <Popup>
                <div className="text-center min-w-[150px]">
                  <Bus className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <h3 className="font-bold text-lg">{driver.name}</h3>
                  <p className="text-sm text-gray-600">Bus {driver.busId}</p>
                  <div className="mt-2 space-y-1">
                    <Badge className={driver.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}>
                      {driver.status.toUpperCase()}
                    </Badge>
                    <div className="text-sm">
                      <strong>{driver.studentsCount}</strong> students assigned
                    </div>
                    {location && (
                      <div className="text-xs text-gray-500">
                        Last seen: {new Date(location.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Student Home Markers */}
        {students.map((student, index) => (
          <Marker
            key={student.id}
            position={getStudentPosition(student.id, index)}
            icon={studentIcon}
          >
            <Popup>
              <div className="text-center">
                <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <strong>{student.name}</strong>
                <br />
                <small>Bus {student.busId}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 rounded-lg p-4 text-white text-sm space-y-3 z-[1000]">
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
            Active: {drivers.filter(d => d.status === 'active').length}<br/>
            Students: {students.length}
          </div>
        </div>
      </div>

      {/* No Data Overlay */}
      {drivers.filter(d => d.status === 'active').length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-[1000]">
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
