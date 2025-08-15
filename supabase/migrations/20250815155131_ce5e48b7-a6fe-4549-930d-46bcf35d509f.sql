-- Clean up any existing demo data and add sample bus locations for testing
DELETE FROM public.bus_locations WHERE bus_id IN ('bus-001', 'bus-002', 'bus-003');

-- Add sample bus locations for demo (these will show up on maps)
INSERT INTO public.bus_locations (bus_id, driver_id, latitude, longitude, speed, heading, is_active) VALUES
('bus-001', 'demo-driver-1', 22.736995, 75.919283, 15, 90, true),
('bus-002', 'demo-driver-2', 22.740000, 75.920000, 25, 45, true),
('bus-003', 'demo-driver-3', 22.730000, 75.915000, 30, 180, true),
('bus-004', 'demo-driver-4', 22.745000, 75.925000, 20, 270, true),
('bus-005', 'demo-driver-5', 22.725000, 75.910000, 35, 0, true);