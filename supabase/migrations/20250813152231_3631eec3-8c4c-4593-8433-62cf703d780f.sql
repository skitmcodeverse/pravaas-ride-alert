-- Create bus_locations table for real-time tracking
CREATE TABLE public.bus_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'student')),
  bus_id TEXT,
  home_latitude DOUBLE PRECISION,
  home_longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_bus_assignments table
CREATE TABLE public.student_bus_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bus_id TEXT NOT NULL,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_bus_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bus_locations
CREATE POLICY "Anyone can view bus locations" 
ON public.bus_locations 
FOR SELECT 
USING (true);

CREATE POLICY "Drivers can insert their bus location" 
ON public.bus_locations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Drivers can update their bus location" 
ON public.bus_locations 
FOR UPDATE 
USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for student_bus_assignments
CREATE POLICY "Anyone can view student bus assignments" 
ON public.student_bus_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Students can manage their assignments" 
ON public.student_bus_assignments 
FOR ALL 
USING (true);

-- Enable realtime for bus_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_locations;
ALTER TABLE public.bus_locations REPLICA IDENTITY FULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_bus_locations_updated_at
  BEFORE UPDATE ON public.bus_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_bus_assignments_updated_at
  BEFORE UPDATE ON public.student_bus_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.profiles (user_id, email, name, role, bus_id, home_latitude, home_longitude) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@pravaas.com', 'Admin User', 'admin', NULL, 22.736995, 75.919283),
  ('22222222-2222-2222-2222-222222222222', 'driver@pravaas.com', 'John Driver', 'driver', 'bus-001', 22.736995, 75.919283),
  ('33333333-3333-3333-3333-333333333333', 'student@pravaas.com', 'Jane Student', 'student', 'bus-001', 22.736995, 75.919283);