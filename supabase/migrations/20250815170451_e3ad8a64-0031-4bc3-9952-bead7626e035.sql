-- Create buses table for driver management
CREATE TABLE public.buses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id TEXT NOT NULL UNIQUE,
  driver_name TEXT,
  driver_mobile TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;

-- Create policies for buses
CREATE POLICY "Anyone can view buses" 
ON public.buses 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage buses" 
ON public.buses 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add trigger for timestamps
CREATE TRIGGER update_buses_updated_at
BEFORE UPDATE ON public.buses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial bus data
INSERT INTO public.buses (bus_id, driver_name, driver_mobile) VALUES 
('S19', 'Vishal', '626792349');

-- Create additional empty buses S1-S22 (excluding S19)
INSERT INTO public.buses (bus_id, driver_name, driver_mobile) VALUES 
('S1', NULL, NULL),
('S2', NULL, NULL),
('S3', NULL, NULL),
('S4', NULL, NULL),
('S5', NULL, NULL),
('S6', NULL, NULL),
('S7', NULL, NULL),
('S8', NULL, NULL),
('S9', NULL, NULL),
('S10', NULL, NULL),
('S11', NULL, NULL),
('S12', NULL, NULL),
('S13', NULL, NULL),
('S14', NULL, NULL),
('S15', NULL, NULL),
('S16', NULL, NULL),
('S17', NULL, NULL),
('S18', NULL, NULL),
('S20', NULL, NULL),
('S21', NULL, NULL),
('S22', NULL, NULL);

-- Add UID column to profiles for student authentication
ALTER TABLE public.profiles ADD COLUMN student_uid TEXT UNIQUE;

-- Update profiles to support UID-based authentication for students
-- Admin remains email-based
UPDATE public.profiles SET student_uid = NULL WHERE role = 'admin';