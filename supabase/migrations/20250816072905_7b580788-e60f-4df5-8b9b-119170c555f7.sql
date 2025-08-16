-- Clean up the duplicate admin profile with driver role
DELETE FROM profiles 
WHERE email = 'admin@pravaas.com' AND role = 'driver';

-- Create a proper admin user through signup process by inserting into auth.users
-- Note: We'll use a simpler approach and let the application create the auth user
-- For now, let's just ensure the profile is clean
UPDATE profiles 
SET name = 'Admin User'
WHERE email = 'admin@pravaas.com' AND role = 'admin';