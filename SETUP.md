# Task Manager - Complete Setup Guide

This guide will help you run the complete Task Manager application (frontend + backend) on your local machine.

## Prerequisites

- **Docker** and **Docker Compose** installed
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **OR** Manual setup:
  - Node.js 20+ and npm
  - Java 21+ (for backend)

## Quick Start with Docker (Recommended)

This is the **easiest way** to run the complete application:

### Option 1: Run Both Services Together

1. **Clone both repositories** (if not already):
   ```bash
   # Frontend
   git clone <frontend-repo-url> task-manager-frontend

   # Backend
   git clone <backend-repo-url> task-manager-backend
   ```

2. **Start the backend**:
   ```bash
   cd task-manager-backend
   docker-compose up -d
   ```

   Wait for the backend to be healthy (~30-40 seconds):
   ```bash
   # Check health
   curl http://localhost:8080/q/health
   ```

3. **Start the frontend** (in a new terminal):
   ```bash
   cd task-manager-frontend
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/q/swagger-ui
   - Backend Health: http://localhost:8080/q/health

5. **Login with test credentials**:
   - Username: `serhii` / Password: `password`
   - Username: `bagdan` / Password: `password`

### Stop Services

```bash
# Stop frontend
cd task-manager-frontend
docker-compose down

# Stop backend
cd task-manager-backend
docker-compose down
```

---

## Manual Setup (Without Docker)

If you prefer to run services directly:

### 1. Start the Backend

```bash
cd task-manager-backend

# Run tests (optional)
./gradlew test

# Start backend in dev mode
./gradlew quarkusDev

# Backend will be available at http://localhost:8080
```

### 2. Start the Frontend (in a new terminal)

```bash
cd task-manager-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local if needed (default: http://localhost:8080)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Run tests (optional)
npm run test:run

# Start frontend in dev mode
npm run dev

# Frontend will be available at http://localhost:3000
```

---

## Verification

### Check Backend Health

```bash
curl http://localhost:8080/q/health
```

Expected response:
```json
{
  "status": "UP",
  "checks": [...]
}
```

### Check Frontend

Open http://localhost:3000 in your browser. You should see the login page.

### Test the Complete Flow

1. **Login**:
   - Go to http://localhost:3000
   - Username: `serhii`, Password: `password`
   - Click "Sign in"

2. **Create Task**:
   - Click "Create Task" button
   - Fill in title and description
   - Click "Create"

3. **Filter Tasks**:
   - Use status dropdown (All, Pending, In Progress, Completed)
   - Use search box to find tasks

4. **Update Task**:
   - Click "Edit" on any task
   - Change status or details
   - Save changes

5. **Delete Task**:
   - Click "Delete" on any task
   - Confirm deletion

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (Next.js)                         │
│  http://localhost:3000                      │
│                                             │
│  - Login page                               │
│  - Tasks management                         │
│  - Filtering & search                       │
│  - Dark mode                                │
└─────────────────┬───────────────────────────┘
                  │
                  │ REST API
                  │ JWT Authentication
                  │
┌─────────────────▼───────────────────────────┐
│  Backend (Kotlin/Quarkus)                   │
│  http://localhost:8080                      │
│                                             │
│  - JWT Auth (RSA keys generated at startup) │
│  - Task CRUD operations                     │
│  - In-memory storage                        │
│  - OpenAPI/Swagger docs                     │
│  - Health checks & metrics                  │
└─────────────────────────────────────────────┘
```

---

## API Documentation

Once the backend is running, access interactive API documentation:
- **Swagger UI**: http://localhost:8080/q/swagger-ui
- **OpenAPI Spec**: http://localhost:8080/q/openapi

---

## Test Users

The backend comes with two pre-configured test users:

| Username | Password | User ID |
|----------|----------|---------|
| serhii   | password | u1      |
| bagdan   | password | u2      |

Each user can only see and manage their own tasks.

---

## Troubleshooting

### Port Already in Use

**Backend (8080)**:
```bash
# Check what's using port 8080
lsof -i :8080

# Change backend port
./gradlew quarkusDev -Dquarkus.http.port=8081

# Update frontend .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

**Frontend (3000)**:
```bash
# Check what's using port 3000
lsof -i :3000

# Change frontend port
PORT=3001 npm run dev
```

### Docker Issues

**Container won't start**:
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Network issues**:
```bash
# Verify containers are on the same network
docker network inspect task-manager-network

# Check container health
docker ps
```

### Frontend Can't Connect to Backend

1. **Check backend is running**:
   ```bash
   curl http://localhost:8080/q/health
   ```

2. **Check CORS is enabled** (in dev mode, backend allows http://localhost:3000)

3. **Verify environment variable**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

4. **Restart frontend after env change**:
   ```bash
   # Stop frontend
   # Update .env.local
   npm run dev
   ```

### Login Fails

1. **Check backend logs** for authentication errors
2. **Verify test users** exist (they should by default)
3. **Check network tab** in browser DevTools for API errors
4. **Try with curl**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"serhii","password":"password"}'
   ```

### Build Fails

**Frontend**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Backend**:
```bash
# Clean build
./gradlew clean build
```

---

## Development Workflow

### Making Changes

**Frontend**:
- Edit files in `src/`
- Changes auto-reload (hot reload enabled)
- Run tests: `npm run test`
- Check types: `npm run build`

**Backend**:
- Edit files in `src/main/kotlin/`
- Quarkus auto-reloads in dev mode
- Run tests: `./gradlew test`
- Check style: `./gradlew ktlintCheck`

### Running Tests

**Frontend**:
```bash
# Unit tests (watch mode)
npm run test

# Unit tests (single run)
npm run test:run

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

**Backend**:
```bash
# All tests
./gradlew test

# Specific test
./gradlew test --tests "LoginUseCaseTest"

# Integration tests only
./gradlew test --tests "*IT"
```

---

## Production Build

### Frontend

```bash
# Build
npm run build

# Start production server
npm start

# Access at http://localhost:3000
```

### Backend

```bash
# Build JAR
./gradlew build

# Run
java -jar build/quarkus-app/quarkus-run.jar

# Access at http://localhost:8080
```

---

## Environment Variables

### Frontend (.env.local)

```bash
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Optional (for external logging)
# NEXT_PUBLIC_LOG_ENDPOINT=https://your-log-service.com/api/logs
# NEXT_PUBLIC_LOG_API_KEY=your-api-key
```

### Backend (application.properties)

Default configuration works out of the box. For production:

```properties
# Port (default: 8080)
quarkus.http.port=8080

# JWT expiration (default: 120 minutes)
jwt.token.exp.minutes=120

# CORS (auto-configured per profile)
# Dev: enabled for http://localhost:3000
# Prod: disabled
```

---

## Monitoring

### Backend Endpoints

- **Health Check**: http://localhost:8080/q/health
  - Readiness: http://localhost:8080/q/health/ready
  - Liveness: http://localhost:8080/q/health/live
- **Metrics**: http://localhost:8080/q/metrics (Prometheus format)
- **Dev UI**: http://localhost:8080/q/dev/ (dev mode only)

### Logs

**Docker**:
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend
```

**Manual**:
- Backend: Console output (JSON in prod mode)
- Frontend: Browser DevTools + terminal output

---

## Additional Resources

### Frontend
- README.md - Project overview

### Backend
- README.md - Project overview
- Swagger UI - Interactive API docs

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs (docker-compose logs)
3. Verify prerequisites are met
4. Check that ports are available

---

## Quick Reference

```bash
# Docker (complete stack)
cd task-manager-backend && docker-compose up -d
cd task-manager-frontend && docker-compose up -d

# Manual (dev mode)
cd task-manager-backend && ./gradlew quarkusDev
cd task-manager-frontend && npm run dev

# Access
Frontend: http://localhost:3000
Backend:  http://localhost:8080
Swagger:  http://localhost:8080/q/swagger-ui

# Test credentials
Username: serhii / Password: password
Username: bagdan / Password: password
```

Happy reviewing! 🚀
