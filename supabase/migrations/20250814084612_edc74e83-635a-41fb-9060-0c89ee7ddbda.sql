-- First delete existing demo users if they exist
DELETE FROM public.profiles WHERE email IN ('admin@pravaas.com', 'driver@pravaas.com', 'student@pravaas.com');
DELETE FROM auth.users WHERE email IN ('admin@pravaas.com', 'driver@pravaas.com', 'student@pravaas.com');

-- Create demo users with proper Supabase auth setup
-- Note: These users need to be created through the Supabase signup flow in the app
-- This migration just sets up the profiles table with the expected user IDs

-- Insert profiles for demo users (we'll create the auth users through the UI)
INSERT INTO public.profiles (user_id, email, name, role, bus_id, home_latitude, home_longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@pravaas.com', 'Admin Demo', 'admin', null, 22.736995, 75.919283),
('22222222-2222-2222-2222-222222222222', 'driver@pravaas.com', 'Driver Demo', 'driver', 'bus-001', 22.736995, 75.919283),
('33333333-3333-3333-3333-333333333333', 'student@pravaas.com', 'Student Demo', 'student', 'bus-001', 22.736995, 75.919283)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  bus_id = EXCLUDED.bus_id;

-- Add more sample bus locations for testing
INSERT INTO public.bus_locations (bus_id, driver_id, latitude, longitude, speed, heading, is_active) VALUES
('bus-002', '22222222-2222-2222-2222-222222222222', 22.740000, 75.920000, 25, 45, true),
('bus-003', '22222222-2222-2222-2222-222222222222', 22.730000, 75.915000, 30, 90, true)
ON CONFLICT (bus_id) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  speed = EXCLUDED.speed,
  heading = EXCLUDED.heading,
  is_active = EXCLUDED.is_active;