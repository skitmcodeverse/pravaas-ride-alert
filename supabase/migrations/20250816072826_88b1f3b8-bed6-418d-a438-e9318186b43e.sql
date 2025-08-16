-- Clean up duplicate profiles 
DELETE FROM profiles WHERE email = 'admin@pravaas.com' AND role = 'driver';

-- Ensure we have the correct admin profile
INSERT INTO profiles (user_id, email, name, role, bus_id)
VALUES (
  gen_random_uuid(),
  'admin@pravaas.com', 
  'Admin User',
  'admin',
  NULL
)
ON CONFLICT (email, role) DO NOTHING;