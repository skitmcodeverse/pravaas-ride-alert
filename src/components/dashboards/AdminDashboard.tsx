
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LogOut, 
  Users, 
  Bus, 
  MapPin, 
  Settings, 
  Search,
  UserCheck,
  Navigation
} from 'lucide-react';
import AdminMap from '@/components/AdminMap';

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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { busLocations } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'overview' | 'drivers' | 'students'>('overview');

  // Mock data - replace with real data from Supabase
  const drivers: Driver[] = [
    { id: '1', name: 'John Driver', busId: 'bus-001', status: 'active', studentsCount: 12 },
    { id: '2', name: 'Sarah Wilson', busId: 'bus-002', status: 'inactive', studentsCount: 8 },
    { id: '3', name: 'Mike Johnson', busId: 'bus-003', status: 'active', studentsCount: 15 },
  ];

  const students: Student[] = [
    { id: '1', name: 'Jane Student', busId: 'bus-001' },
    { id: '2', name: 'Alex Brown', busId: 'bus-001' },
    { id: '3', name: 'Emma Davis', busId: 'bus-002' },
    { id: '4', name: 'Ryan Miller', busId: 'bus-003' },
  ];

  const activeBuses = drivers.filter(d => d.status === 'active').length;
  const totalStudents = students.length;
  const totalDrivers = drivers.length;

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.busId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.busId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ADMIN CONTROL</h1>
              <p className="text-slate-400 text-sm">{user?.name}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drivers, students..."
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <Button
            variant={selectedView === 'overview' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedView('overview')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={selectedView === 'drivers' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedView('drivers')}
          >
            <Bus className="w-4 h-4 mr-2" />
            Drivers ({totalDrivers})
          </Button>
          <Button
            variant={selectedView === 'students' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedView('students')}
          >
            <Users className="w-4 h-4 mr-2" />
            Students ({totalStudents})
          </Button>
        </div>

        {/* Content based on selected view */}
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {selectedView === 'overview' && (
            <div className="space-y-4">
              <Card className="bg-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Bus className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold">{activeBuses}</div>
                      <div className="text-slate-400 text-sm">Active Buses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold">{totalStudents}</div>
                      <div className="text-slate-400 text-sm">Total Students</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold">{totalDrivers}</div>
                      <div className="text-slate-400 text-sm">Total Drivers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedView === 'drivers' && (
            <div className="space-y-3">
              {filteredDrivers.map((driver) => (
                <Card key={driver.id} className="bg-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{driver.name}</h3>
                      <Badge className={driver.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}>
                        {driver.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Bus: {driver.busId}</div>
                      <div>Students: {driver.studentsCount}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedView === 'students' && (
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="bg-slate-700">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{student.name}</h3>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Bus: {student.busId}</div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {student.homeLocation ? 'Location Set' : 'No Location'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <Button variant="ghost" onClick={logout} className="w-full text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <AdminMap locations={busLocations} drivers={drivers} students={students} />
      </div>
    </div>
  );
};

export default AdminDashboard;
