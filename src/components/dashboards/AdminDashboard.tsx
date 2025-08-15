import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  LogOut, 
  Users, 
  Bus, 
  MapPin, 
  Settings, 
  Search,
  UserCheck,
  Navigation,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import AdminMap from '@/components/AdminMap';

interface Bus {
  id: string;
  bus_id: string;
  driver_name: string | null;
  driver_mobile: string | null;
  is_active: boolean;
}

interface Student {
  id: string;
  name: string;
  busId: string;
  student_uid: string;
  homeLocation?: { lat: number; lng: number };
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { busLocations } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'overview' | 'buses' | 'students'>('overview');
  const [buses, setBuses] = useState<Bus[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchBuses();
    fetchStudents();
  }, []);

  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('bus_id');
      
      if (error) throw error;
      setBuses(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching buses",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, bus_id, student_uid, home_latitude, home_longitude')
        .eq('role', 'student');
      
      if (error) throw error;
      
      const studentsData = (data || []).map(student => ({
        id: student.id,
        name: student.name,
        busId: student.bus_id || '',
        student_uid: student.student_uid || '',
        homeLocation: student.home_latitude && student.home_longitude 
          ? { lat: student.home_latitude, lng: student.home_longitude }
          : undefined
      }));
      
      setStudents(studentsData);
    } catch (error: any) {
      toast({
        title: "Error fetching students",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setIsEditDialogOpen(true);
  };

  const handleSaveBus = async () => {
    if (!editingBus) return;
    
    try {
      const { error } = await supabase
        .from('buses')
        .update({
          driver_name: editingBus.driver_name,
          driver_mobile: editingBus.driver_mobile,
          is_active: editingBus.is_active,
        })
        .eq('id', editingBus.id);

      if (error) throw error;

      toast({
        title: "Bus updated successfully",
        description: `Bus ${editingBus.bus_id} has been updated`,
      });

      setIsEditDialogOpen(false);
      setEditingBus(null);
      fetchBuses();
    } catch (error: any) {
      toast({
        title: "Error updating bus",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const activeBuses = buses.filter(b => b.is_active).length;
  const totalStudents = students.length;
  const totalBuses = buses.length;

  const filteredBuses = buses.filter(bus =>
    bus.bus_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.busId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert buses to drivers format for AdminMap
  const drivers = buses
    .filter(bus => bus.driver_name)
    .map(bus => ({
      id: bus.id,
      name: bus.driver_name!,
      busId: bus.bus_id,
      status: bus.is_active ? 'active' as const : 'inactive' as const,
      studentsCount: students.filter(s => s.busId === bus.bus_id).length,
    }));

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
              placeholder="Search buses, drivers, students..."
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
            variant={selectedView === 'buses' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedView('buses')}
          >
            <Bus className="w-4 h-4 mr-2" />
            Buses ({totalBuses})
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
                      <div className="text-2xl font-bold">{totalBuses}</div>
                      <div className="text-slate-400 text-sm">Total Buses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedView === 'buses' && (
            <div className="space-y-3">
              {filteredBuses.map((bus) => (
                <Card key={bus.id} className="bg-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{bus.bus_id}</h3>
                      <div className="flex gap-2">
                        <Badge className={bus.is_active ? 'bg-green-500' : 'bg-slate-500'}>
                          {bus.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditBus(bus)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Driver: {bus.driver_name || 'Not assigned'}</div>
                      <div>Mobile: {bus.driver_mobile || 'N/A'}</div>
                      <div>Students: {students.filter(s => s.busId === bus.bus_id).length}</div>
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
                      <div>UID: {student.student_uid}</div>
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

      {/* Edit Bus Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Bus {editingBus?.bus_id}
            </DialogTitle>
          </DialogHeader>
          {editingBus && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="driverName" className="text-white">Driver Name</Label>
                <Input
                  id="driverName"
                  value={editingBus.driver_name || ''}
                  onChange={(e) => setEditingBus({
                    ...editingBus,
                    driver_name: e.target.value || null
                  })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter driver name"
                />
              </div>
              <div>
                <Label htmlFor="driverMobile" className="text-white">Driver Mobile</Label>
                <Input
                  id="driverMobile"
                  value={editingBus.driver_mobile || ''}
                  onChange={(e) => setEditingBus({
                    ...editingBus,
                    driver_mobile: e.target.value || null
                  })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingBus.is_active}
                  onChange={(e) => setEditingBus({
                    ...editingBus,
                    is_active: e.target.checked
                  })}
                  className="rounded"
                />
                <Label htmlFor="isActive" className="text-white">Bus is active</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveBus} className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;