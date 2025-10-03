-- Create Admin User Database Records
-- Execute these commands in your PostgreSQL database

-- Step 1: Create or update user record
-- Note: Replace 'FIREBASE_USER_UID' with the actual UID from Firebase Auth
INSERT INTO users (
  id,
  email,
  address,
  created_at,
  updated_at
)
VALUES (
  'FIREBASE_USER_UID', -- Replace with actual Firebase UID
  'vrdivebar@gmail.com',
  '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  address = '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
  updated_at = NOW();

-- Step 2: Verify user was created
SELECT id, email, address, created_at
FROM users
WHERE email = 'vrdivebar@gmail.com';

-- Step 3: Create admin role record
-- This will automatically use the user_id from the users table
INSERT INTO admin_roles (
  id,
  user_id,
  role,
  permissions,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  id,
  'SUPER_ADMIN',
  ARRAY['ALL'],
  true,
  NOW(),
  NOW()
FROM users
WHERE email = 'vrdivebar@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'SUPER_ADMIN',
  permissions = ARRAY['ALL'],
  is_active = true,
  updated_at = NOW();

-- Step 4: Verify admin role was created
SELECT
  ar.id,
  ar.role,
  ar.permissions,
  ar.is_active,
  u.email,
  u.address
FROM admin_roles ar
JOIN users u ON ar.user_id = u.id
WHERE u.email = 'vrdivebar@gmail.com';

-- Optional: Grant specific permissions instead of ALL
-- UPDATE admin_roles
-- SET permissions = ARRAY[
--   'VERIFY_PAYMENTS',
--   'MANAGE_USERS',
--   'VIEW_ANALYTICS',
--   'MANAGE_ADMINS',
--   'SYSTEM_CONFIG'
-- ]
-- WHERE user_id = (SELECT id FROM users WHERE email = 'vrdivebar@gmail.com');
