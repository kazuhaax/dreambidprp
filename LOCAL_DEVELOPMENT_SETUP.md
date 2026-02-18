# Local Development Setup Guide

This guide will help you run the DreamBid application locally on your laptop with both backend and frontend working together.

## Prerequisites

Before starting, ensure you have installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

## Step 1: Set Up PostgreSQL Database

### On macOS (using Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Access PostgreSQL
psql postgres
```

### On Linux (Ubuntu/Debian):
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Access PostgreSQL
sudo -u postgres psql
```

### On Windows:
1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. During installation, remember the password you set for the `postgres` user
3. PostgreSQL will start automatically

## Step 2: Create Database and User

Open PostgreSQL terminal and run:

```sql
-- Create database
CREATE DATABASE dreambid;

-- Create user (if not exists)
CREATE USER postgres WITH PASSWORD 'postgres';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dreambid TO postgres;

-- Connect to the database
\c dreambid

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO postgres;

-- Exit
\q
```

## Step 3: Configure Environment Variables

The `.env` file is already configured for local development:

```env
# Database Configuration - Local Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dreambid
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration
VITE_API_URL=http://localhost:5000/api
```

**Note:** If you used a different password for PostgreSQL, update `DB_PASSWORD` in the `.env` file.

## Step 4: Install Dependencies

```bash
# Navigate to project root
cd /home/kazuha/work/dreambid/unified-dreambid

# Install all dependencies
npm install
```

## Step 5: Initialize Database

The database will be automatically initialized when you start the backend server for the first time. The `setup-database.sql` script will:
- Create all necessary tables
- Set up relationships
- Seed initial property data

## Step 6: Start Development Servers

You have two options:

### Option A: Run Both Servers Together (Recommended)
```bash
npm run dev
```

This command runs:
- **Backend Server** on `http://localhost:5000`
- **Frontend Server** on `http://localhost:5173`

### Option B: Run Servers Separately

Terminal 1 - Start Backend:
```bash
npm run dev:server
```
Backend will run on `http://localhost:5000`

Terminal 2 - Start Frontend:
```bash
npm run dev:client
```
Frontend will run on `http://localhost:5173`

## Step 7: Access the Application

1. Open your browser
2. Go to `http://localhost:5173`
3. You should see the DreamBid home page

## Default Login Credentials

- **Email:** admin@dreambid.com
- **Password:** admin123

## Troubleshooting

### Database Connection Issues

**Error: "connect ECONNREFUSED 127.0.0.1:5432"**

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify PostgreSQL is listening on port 5432

**Commands to check/restart PostgreSQL:**

**macOS:**
```bash
brew services list  # Check if running
brew services stop postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

**Windows:**
- Use PostgreSQL pgAdmin (included in installer)
- Or check Services in Windows Task Manager

### Frontend/Backend Communication Issues

**Error: "Cannot GET /api/..."**

- Ensure backend server is running on `http://localhost:5000`
- Check that `VITE_API_URL=http://localhost:5000/api` in `.env`
- Check browser console for CORS errors
- Verify firewall isn't blocking port 5000

### Port Already in Use

If port 5000 or 5173 is already in use:

**Option 1:** Kill the process using the port

Linux/macOS:
```bash
# Find process on port 5000
lsof -i :5000
# Kill it
kill -9 <PID>
```

**Option 2:** Use different ports

Update `.env`:
```env
PORT=5001  # Change backend port
```

Update `vite.config.js`:
```javascript
server: {
  port: 5174,  // Change frontend port
```

### Nodemon Not Watching Files

If changes to server files aren't triggering restarts:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall nodemon
npm install --save-dev nodemon

# Try dev server again
npm run dev:server
```

## Development Workflow

1. **Backend changes** (`.js` files in controllers, routes, models, etc.)
   - Nodemon automatically restarts the server
   - Check terminal for any errors

2. **Frontend changes** (`.jsx` and `.css` files in `src/`)
   - Vite HMR (Hot Module Replacement) automatically updates
   - Changes appear in browser instantly

3. **Database schema changes**
   - Modify `setup-database.sql`
   - Drop and recreate database:
     ```sql
     DROP DATABASE dreambid;
     CREATE DATABASE dreambid;
     ```
   - Restart backend to re-run initialization

## Building for Production

```bash
# Build frontend
npm run build

# Output will be in 'dist/' directory
```

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Getting Help

If you encounter issues:

1. Check the browser console (F12) for frontend errors
2. Check the terminal for backend errors
3. Verify all services are running:
   - PostgreSQL: `psql -l`
   - Backend: `curl http://localhost:5000/api/health` (if endpoint exists)
   - Frontend: `http://localhost:5173` in browser
