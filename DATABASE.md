# DreamBid Database Schema & Setup Guide

## Overview
This document describes the DreamBid database schema, seeding process, and migration procedures.

## Database Files

### 1. **setup-database.sql**
The complete database schema with all tables, constraints, and initial data.
- Creates all necessary tables with proper constraints
- Sets up indexes for performance optimization
- Inserts the admin user with bcrypt-hashed password
- Safe to run multiple times (uses `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT`)

### 2. **seed-properties.sql**
Sample property data for development and testing.
- Inserts 5 sample properties across different cities
- Adds gallery images for each property
- Uses real image URLs from Unsplash for demo purposes

### 3. **migrations.sql**
Database migration scripts for schema updates and fixes.
- Use this when upgrading from older versions
- All migrations are idempotent (safe to run multiple times)
- Documents the status and reason for each change

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,      -- Bcrypt hashed
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  profile_photo VARCHAR(500),                -- URL to user's profile photo
  role VARCHAR(50) DEFAULT 'user',           -- admin, staff, or user
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Default Admin User:**
- Email: `admin@dreambid.com`
- Password: `admin123` (bcrypt hashed)
- Role: `admin`

### Properties Table
Contains all property listings for auctions.
```sql
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(100),                -- villa, apartment, commercial, land, house, etc.
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  area_sqft DECIMAL(10, 2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  reserve_price DECIMAL(15, 2) NOT NULL,    -- Minimum bid price
  auction_date TIMESTAMP NOT NULL,
  auction_status VARCHAR(50),                -- upcoming, active, expired, sold, cancelled
  cover_image_url VARCHAR(500),              -- Main property image
  pdf_url VARCHAR(500),                      -- Property details PDF
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  enquiries_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Property Images Table
Gallery images for properties.
```sql
CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_order INTEGER DEFAULT 0,             -- Order in gallery
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enquiries Table
User inquiries about properties.
```sql
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT,
  enquiry_type VARCHAR(50),                  -- general, bid, inspection, complaint
  status VARCHAR(50),                        -- new, contacted, resolved, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Property Interests Table
Tracks user interactions with properties.
```sql
CREATE TABLE property_interests (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  interest_type VARCHAR(50),                 -- view, share, contact, save
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Activity Table
Logs all user activities for audit trail.
```sql
CREATE TABLE user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,              -- login, logout, register, profile_updated, etc.
  action_category VARCHAR(50),               -- authentication, profile, property, enquiry, etc.
  data JSONB DEFAULT NULL,                   -- Additional context data
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

### Initial Setup (Fresh Database)
```bash
# 1. Create database
psql -h localhost -U postgres -c "CREATE DATABASE dreambid;"

# 2. Run schema initialization (via API server startup)
# The server automatically runs setup-database.sql on first startup

# 3. Optionally, seed sample data manually
psql -h localhost -U postgres -d dreambid -f seed-properties.sql
```

### Updating Existing Database

If you're upgrading from an older version:

```bash
# Run migrations to add/fix schema
psql -h localhost -U postgres -d dreambid -f migrations.sql

# Verify schema is correct
psql -h localhost -U postgres -d dreambid -c "\d users"
```

### Key Columns to Remember

**Users Table:**
- `profile_photo` - Store URLs to profile images, not file paths
- `password_hash` - Always use bcrypt hashing (10 salt rounds minimum)
- `role` - Use CHECK constraint to limit values to 'admin', 'staff', 'user'

**Properties Table:**
- `auction_status` - Use CHECK constraint for valid statuses
- `reserve_price` - Store as DECIMAL for financial accuracy
- `auction_date` - Use TIMESTAMP for timezone awareness

**User Activity Table:**
- `data` - Use JSONB for flexible logging of additional context
- `action_category` - Helps with filtering logs by type

## Performance Indexes

The following indexes are created for optimal query performance:

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);

-- Property search filters
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_auction_status ON properties(auction_status);
CREATE INDEX idx_properties_auction_date ON properties(auction_date);
CREATE INDEX idx_properties_is_active ON properties(is_active);

-- Relationship queries
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_enquiries_property_id ON enquiries(property_id);
CREATE INDEX idx_enquiries_user_id ON enquiries(user_id);

-- Activity tracking
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX idx_user_activity_user_date ON user_activity(user_id, created_at DESC);
```

## Security Notes

1. **Passwords:** Always use bcrypt hashing with at least 10 salt rounds
2. **Admin Credentials:** Change the default admin password in production
3. **Database User:** Use separate database users with minimal required permissions
4. **SSL:** Enable SSL for database connections in production
5. **Backups:** Regular database backups are essential for data protection

## Environment Variables

```env
# Local Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dreambid
DB_USER=postgres
DB_PASSWORD=postgres

# Production (via DATABASE_URL)
DATABASE_URL=postgresql://user:password@host:port/dreambid

# Server
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=production
```

## Migration Checklist

When deploying to production:

- [ ] Back up existing database
- [ ] Run migration scripts: `psql -f migrations.sql`
- [ ] Verify schema with: `\d`
- [ ] Test all API endpoints
- [ ] Check user authentication
- [ ] Verify activity logging
- [ ] Monitor database performance

## Adding New Migrations

To add a new migration:

1. Add the migration SQL to `migrations.sql`
2. Mark status as PENDING
3. Test thoroughly in development
4. Update status to COMPLETED
5. Document the reason for the change

Example:
```sql
-- Migration X: Add verification_token to users
-- Status: COMPLETED
-- Reason: Support email verification workflow
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP;
```

## Troubleshooting

### Table doesn't exist error
- Run `setup-database.sql` again
- Check: `psql -d dreambid -c "\dt"`

### Column doesn't exist error
- Run `migrations.sql` to add missing columns
- Check: `psql -d dreambid -c "\d table_name"`

### Permission denied errors
- Verify database user has proper permissions
- Check: `psql -U postgres -d dreambid -c "GRANT ALL ON DATABASE dreambid TO postgres;"`

### Data corruption/inconsistency
- Review recent migrations for issues
- Run `VACUUM ANALYZE` to optimize query planner
- Contact database administrator for recovery options
