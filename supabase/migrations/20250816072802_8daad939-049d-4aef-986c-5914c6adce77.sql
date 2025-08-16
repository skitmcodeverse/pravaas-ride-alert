-- Create admin user in auth system
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@pravaas.com',
  crypt('pravaas@admin', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Clean up duplicate profiles and ensure only one admin profile exists
DELETE FROM profiles WHERE email = 'admin@pravaas.com' AND role = 'driver';

-- Update admin profile to link to auth user
UPDATE profiles 
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@pravaas.com')
WHERE email = 'admin@pravaas.com' AND role = 'admin';