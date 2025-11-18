# Task Manager Frontend

A modern, production-ready task management application built with Next.js, TypeScript, and shadcn/ui.

## 🚀 Quick Start

**For reviewers**: See [SETUP.md](./SETUP.md) for complete setup instructions including Docker deployment.

## Features

- **Authentication**: Secure JWT-based authentication with automatic token expiration handling
- **Task Management**: Create, read, update, and delete tasks with full CRUD operations
- **Advanced Filtering**: Filter tasks by status (Pending, In Progress, Completed)
- **Search**: Real-time search across task titles and descriptions
- **Sorting**: Multiple sorting options (by creation date, update date)
- **Pagination**: Efficient pagination for large task lists
- **Dark Mode**: Full dark mode support with user preference persistence
- **Loading States**: Skeleton loaders for improved perceived performance
- **Form Validation**: Client-side validation using Zod schemas
- **Token Management**: Proactive token expiration checks with user warnings
- **Error Handling**: Comprehensive error handling with structured logging
- **Responsive Design**: Fully responsive UI that works on all devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS 4
- **Production Ready**: Full test coverage, proper error handling, and optimized build

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Hooks
- **Form Handling**: react-hook-form with Zod validation
- **API Client**: Native Fetch API with structured error handling
- **Testing**: Vitest + Testing Library (56 tests)
- **Notifications**: Sonner (Toast notifications)
- **Logging**: Structured logging with environment-aware behavior

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Backend API running (default: http://localhost:8080)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd task-manager-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Login

Use your credentials to log in. The application will redirect you to the tasks page after successful authentication.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests in watch mode
- `npm run test:run` - Run unit tests once
- `npm run test:ui` - Open Vitest UI
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Open Playwright UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:e2e:debug` - Debug E2E tests

## Docker Deployment

**See [SETUP.md](./SETUP.md) for complete Docker instructions including running both frontend and backend.**

### Frontend Only

```bash
# Build and run frontend only
docker-compose up -d

# Or manual Docker build
docker build -t task-manager-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 task-manager-frontend
```

### Full Stack (Frontend + Backend)

If you have both repositories cloned side by side:

```bash
# From frontend directory
docker-compose -f docker-compose.full.yml up --build

# This will start:
# - Backend:  http://localhost:8080
# - Frontend: http://localhost:3000
# - Swagger:  http://localhost:8080/q/swagger-ui
```

**Test credentials**: `serhii/password` or `bagdan/password`

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── login/             # Login page
│   ├── tasks/             # Tasks page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── tasks/            # Task management components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   └── useTasks.ts       # Tasks management hook
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
    └── api.ts          # API types
```

## API Integration

The application integrates with a REST API with the following endpoints:

### Authentication
- `POST /api/v1/auth/login` - User login

### Tasks
- `GET /api/v1/tasks` - List tasks (with filtering, search, pagination)
- `POST /api/v1/tasks` - Create a task
- `GET /api/v1/tasks/:id` - Get a specific task
- `PUT /api/v1/tasks/:id` - Update a task
- `DELETE /api/v1/tasks/:id` - Delete a task

## Features in Detail

### Authentication
- JWT token-based authentication with secure storage
- Automatic token storage in localStorage and cookies
- Protected routes with Next.js middleware
- Automatic redirect to login for unauthenticated users
- **Token Expiration Management**:
  - Proactive client-side expiration checks before API requests
  - Background monitoring with 5-minute warning notifications
  - Automatic logout and cleanup on expiration
  - Session expired message on login page

### Task Management
- **Create**: Add new tasks with validated title and optional description
- **Read**: View all tasks in a sortable, filterable table with skeleton loading
- **Update**: Edit task title, description, and status with inline forms
- **Delete**: Remove tasks with confirmation dialog
- **Form Validation**: Real-time validation using Zod schemas

### Filtering & Search
- Filter by status (All, Pending, In Progress, Completed)
- Real-time search across task titles and descriptions
- Sort by creation date or update date (ascending/descending)
- Pagination with configurable page size

### User Experience
- **Loading States**: Skeleton loaders for table, stats, and UI elements
- **Dark Mode**: System preference detection with manual toggle
- **Error Handling**: User-friendly toast notifications for all errors
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Confirmation Dialogs**: Safety checks for destructive actions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Quality & Testing

The project maintains high code quality standards:

### Testing
- **Unit Tests**: 56 comprehensive tests covering:
  - API client (20 tests)
  - Authentication hook (9 tests)
  - Tasks management hook (15 tests)
  - Login form component (12 tests)
- **E2E Tests**: Playwright tests for critical user flows
  - Authentication flows
  - Task CRUD operations
  - Accessibility checks
  - Multi-browser support (Chrome, Firefox, Safari)
- **Test Tools**: Vitest, Testing Library, Playwright, jsdom
- **Coverage**: Core functionality fully tested
- Run tests: `npm run test:run` (unit) or `npm run test:e2e` (E2E)

### Code Standards
- **TypeScript**: Strict mode enabled with full type safety
- **ESLint**: Enforces code quality and React best practices
- **Linting**: 0 errors, minimal warnings (only for intentional patterns)
- **Production Logging**: Structured logging with environment-aware behavior

### Architecture
- **Clean Code**: Separation of concerns, DRY principles
- **Custom Hooks**: Reusable logic abstraction (useAuth, useTasks, useTheme, useTokenExpiration)
- **Type Safety**: Full TypeScript coverage with no `any` types in production code
- **Error Handling**:
  - React Error Boundaries for graceful error recovery
  - Comprehensive API error handling
  - Structured error logging and monitoring
- **Performance**:
  - Optimized re-renders with React hooks
  - Skeleton loading states
  - Pagination for large datasets
  - Web Vitals monitoring (LCP, FID, CLS, FCP, TTFB, INP)
- **Monitoring**:
  - Structured logging with external service integration
  - Error tracking ready (Sentry, LogRocket)
  - Performance monitoring with Web Vitals
  - User session tracking

## Production Readiness Checklist

✅ **Security**
- JWT authentication with secure token storage
- Protected routes with Next.js middleware
- XSS protection through React's built-in escaping
- CSRF protection via SameSite cookies
- Token expiration handling with proactive checks

✅ **Performance**
- Skeleton loaders for improved perceived performance
- Optimized Next.js 16 with Turbopack
- Pagination for large datasets
- Efficient re-renders with React hooks
- Web Vitals monitoring (LCP, FID, CLS, FCP, TTFB, INP)

✅ **User Experience**
- Dark mode support with system preference detection
- Loading states everywhere (skeletons, spinners)
- Comprehensive error handling with friendly messages
- Responsive mobile-first design
- Accessibility features (ARIA labels, keyboard navigation)
- Toast notifications for user feedback

✅ **Code Quality**
- 56 passing unit tests (100% core functionality)
- E2E tests with Playwright (multi-browser)
- TypeScript strict mode enabled
- ESLint with 0 errors
- Structured logging system
- Clean architecture with custom hooks

✅ **Monitoring & Error Tracking**
- React Error Boundaries for graceful error recovery
- Structured logging with external service integration
- Error tracking ready (Sentry, LogRocket, DataDog)
- Web Vitals performance monitoring
- User context tracking for debugging

✅ **DevOps & Deployment**
- Docker support with docker-compose
- Environment variable configuration
- Production build optimization
- Health check ready
- CI/CD friendly (all tests automated)

## Monitoring & Error Tracking Setup

The application is ready for production monitoring services. To enable:

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Set environment variables:
```
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

Uncomment integration code in:
- `src/lib/monitoring.ts` - Sentry initialization
- Already integrated with Error Boundary and Logger

### Web Vitals (Google Analytics 4)
Add to your `public/index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

Set environment variable:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
```

Web Vitals are automatically reported via `src/components/WebVitalsReporter.tsx`

### LogRocket (Session Replay)
```bash
npm install logrocket
```

Uncomment integration code in `src/lib/monitoring.ts`

### DataDog (APM & Logging)
Install RUM SDK and configure in `src/lib/monitoring.ts`

All error tracking, logging, and performance monitoring hooks are already in place and ready to use!

## License

This project is part of a technical assessment.

## Support

For issues or questions, please open an issue in the GitHub repository.
