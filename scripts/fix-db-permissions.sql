-- Fix database permissions for c12usd_user
\c c12usd_production;

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE c12usd_production TO c12usd_user;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO c12usd_user;

-- Grant all privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO c12usd_user;

-- Grant all privileges on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO c12usd_user;

-- Grant all privileges on all functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO c12usd_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO c12usd_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO c12usd_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO c12usd_user;

-- Show current permissions
\dp

-- List databases and users
\l
\du