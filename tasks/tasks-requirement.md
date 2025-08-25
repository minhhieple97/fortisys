# FortiSys Tech Test - Implementation Task List

## Project Overview
This task list implements a fullstack worker vitals dashboard application with real-time monitoring capabilities. The system will handle high-volume data streams from workers in the field, providing real-time monitoring while maintaining performance and security.

## Current State Assessment
- **Backend**: NestJS project with basic structure, Prisma ORM configured, PostgreSQL ready
- **Frontend**: Next.js 15 project with Tailwind CSS, basic template structure
- **Database**: PostgreSQL with Prisma schema setup
- **Architecture**: Standard NestJS/Next.js patterns with TypeScript
- **Queue System**: BullMQ for handling high-volume data processing
- **Caching**: Redis for high-performance data retrieval and storage

## Architecture Overview

### Data Flow Architecture
1. **Frontend Submission** → **Backend API** → **BullMQ Queue** → **Database + Cache Update**
2. **Data Retrieval**: Cache First → Database Fallback → Cache Update

### Caching Strategy
- **Primary Cache**: Redis with optimized data structures
- **Cache Keys**: `worker:{workerId}:vitals:latest` for last 10 records
- **Data Structure**: Sorted Set (ZSET) with timestamp as score for efficient range queries
- **TTL**: 5 minutes for vitals data, 1 hour for worker metadata
- **Cache Invalidation**: On write operations, update both database and cache atomically

### Queue Management
- **BullMQ Configuration**: Redis-backed job queue for high-volume processing
- **Job Types**: `vitals.create`, `vitals.update`, `vitals.bulk`
- **Concurrency**: Configurable worker processes for parallel job execution
- **Retry Logic**: Exponential backoff with max retry attempts
- **Monitoring**: Real-time queue metrics and job progress tracking

## Development Principles

### Backend (NestJS) - Following nest-rule
- **ALWAYS** use `export class` for providers, controllers, and modules
- **ALWAYS** use dependency injection and follow SOLID principles
- **ALWAYS** use repository pattern with Prisma for data access
- **ALWAYS** validate all inputs with class-validator decorators
- **ALWAYS** handle database errors properly with dedicated filters
- **ALWAYS** separate concerns: Controllers (HTTP), Services (Business Logic), Repositories (Data Access)
- **ALWAYS** use feature-based architecture with proper module structure

### Frontend (Next.js) - Following next-rule
- **ALWAYS** prioritize Server Components for data fetching when possible
- **ALWAYS** use `export const` for named exports (no default exports)
- **ALWAYS** create custom hooks for client-side logic separation
- **ALWAYS** use Zod for validation and next-safe-action for server actions
- **ALWAYS** use nuqs for URL parameter handling in Client Components
- **ALWAYS** follow feature-based structure with proper separation of concerns
- **ALWAYS** implement proper error boundaries and loading states

## Relevant Files

### Backend (NestJS - Following nest-rule)
- `backend/src/features/vitals/vitals.module.ts` - Main module for vitals functionality with proper dependency injection
- `backend/src/features/vitals/vitals.module.spec.ts` - Unit tests for VitalsModule structure and dependencies
- `backend/src/features/vitals/controllers/vitals.controller.ts` - API endpoints for vitals data with POST and GET methods, Swagger documentation
- `backend/src/features/vitals/controllers/vitals.controller.spec.ts` - Unit tests for VitalsController with comprehensive endpoint testing
- `backend/src/features/vitals/services/vitals.service.ts` - Business logic for vitals processing with method signatures
- `backend/src/features/vitals/services/vitals.queue.service.ts` - BullMQ queue service for job processing (minimal implementation)
- `backend/src/features/vitals/services/vitals.cache.service.ts` - Redis cache service with optimized data structures, TTL management, and worker metadata tracking
- `backend/src/features/vitals/repositories/vitals.repository.ts` - Prisma repository pattern for data access (minimal implementation)
- `backend/src/features/vitals/dto/create-vitals.dto.ts` - Data transfer objects with class-validator decorators and Swagger documentation
- `backend/src/features/vitals/dto/update-vitals.dto.ts` - Data transfer objects for updates with enhanced validation
- `backend/src/features/vitals/dto/query-vitals.dto.ts` - DTO for time-range queries with pagination support
- `backend/src/features/vitals/dto/vitals-response.dto.ts` - Standardized response DTOs for API consistency
- `backend/src/features/vitals/entities/vitals.entity.ts` - Database entity definitions with Swagger documentation
- `backend/prisma/schema.prisma` - Database schema for vitals table
- `backend/src/config/redis.config.ts` - Redis configuration and connection setup
- `backend/src/cache/cache.service.ts` - Cache service with Redis connection testing
- `backend/src/config/bullmq.config.ts` - BullMQ configuration and queue setup
- `backend/src/common/` - Shared utilities, filters, interceptors, and pipes
- `backend/src/common/filters/` - Exception filters for HTTP, validation, and Prisma errors
- `backend/src/common/interceptors/` - Logging and response transformation interceptors
- `backend/src/common/pipes/` - Global validation pipe configuration
- `backend/src/main.ts` - Application bootstrap with global validation, filters, and Swagger setup
- `backend/src/features/vitals/vitals.controller.spec.ts` - Unit tests for controller
- `backend/src/features/vitals/vitals.service.spec.ts` - Unit tests for service
- `backend/src/features/vitals/vitals.repository.spec.ts` - Unit tests for repository
- `backend/src/features/vitals/services/vitals.queue.service.spec.ts` - Unit tests for VitalsQueueService with BullMQ integration

### Frontend (Next.js - Following next-rule)
- `frontend/src/app/page.tsx` - Main dashboard page (Server Component)
- `frontend/src/app/loading.tsx` - Loading page using skeleton components for streaming mode
- `frontend/src/features/vitals/components/vitals-dashboard.tsx` - Main dashboard component (Server Component)
- `frontend/src/features/vitals/components/vitals-form.tsx` - Data submission form component (Client Component)
- `frontend/src/features/vitals/components/vitals-display.tsx` - Real-time vitals display component (Client Component)
- `frontend/src/features/vitals/components/worker-info.tsx` - Worker information display component
- `frontend/src/features/vitals/actions/submit-vitals.ts` - Server action for data submission
- `frontend/src/features/vitals/queries/get-vitals.ts` - Server-side data fetching
- `frontend/src/features/vitals/services/vitals.service.ts` - Business logic service
- `frontend/src/features/vitals/schemas.ts` - Zod validation schemas
- `frontend/src/features/vitals/types.ts` - TypeScript type definitions
- `frontend/src/features/vitals/hooks/use-vitals-client.ts` - Custom hook for client-side logic
- `frontend/src/features/vitals/hooks/use-vitals-query.ts` - Custom hook using TanStack Query for data fetching
- `frontend/src/lib/api.ts` - API client functions for external calls
- `frontend/src/lib/query-client.ts` - TanStack Query client configuration
- `frontend/src/features/vitals/components/vitals-form.test.tsx` - Unit tests for form component
- `frontend/src/features/vitals/components/vitals-display.test.tsx` - Unit tests for display component

### Notes
- Follow TDD principles by first generating Jest unit tests.
- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- **Always use pnpm for installing additional libraries and dependencies.**
- **Required new dependencies**: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `next-safe-action`

## Tasks

- [x] 1.0 Infrastructure and Database Setup
  - [x] 1.1 Configure database connection and environment variables
  - [x] 1.2 Configure PostgreSQL primary database for write operations
  - [x] 1.3 Set up 2 PostgreSQL read replica databases  
  - [x] 1.4 Design Prisma schema for vitals table with workerId, heartRate, temperature, and timestamp fields  
  - [x] 1.5 Set up database indexes for optimal query performance on timestamp and workerId  
  - [x] 1.6 Run database migrations to create the vitals table
  - [x] 1.7 Set up Redis configuration and connection for caching layer
  - [x] 1.8 Configure BullMQ with Redis backend for job queue management

- [x] 2.0 Backend API Development (TDD Approach)
  - [x] 2.1 **TDD Phase 1**: Write Jest unit tests for VitalsController with POST endpoint expectations
  - [x] 2.2 **TDD Phase 1**: Write Jest unit tests for VitalsService business logic and data processing
  - [x] 2.3 **TDD Phase 1**: Write Jest unit tests for VitalsRepository using Prisma repository pattern
  - [x] 2.4 **TDD Phase 1**: Write Jest unit tests for input sanitization and security measures
  - [x] 2.5 **TDD Phase 2**: Implement VitalsController with POST endpoint for receiving vitals data (HTTP handling only)
  - [x] 2.6 **TDD Phase 2**: Implement VitalsService with business logic for data processing and storage (business orchestration)
  - [x] 2.7 **TDD Phase 2**: Implement VitalsRepository using Prisma repository pattern for data access abstraction
  - [x] 2.8 **TDD Phase 2**: Implement VitalsQueueService for handling high-volume data processing via BullMQ
  - [x] 2.9 **TDD Phase 2**: Implement VitalsCacheService with optimized Redis data structures for performance
  - [x] 2.10 **TDD Phase 2**: Implement data validation DTOs with class-validator decorators and proper validation
  - [x] 2.11 **TDD Phase 2**: Implement error handling filters and interceptors for validation and database errors
  - [x] 2.12 **TDD Phase 2**: Implement GET endpoint to retrieve last 10 vitals records for a worker (cache-first approach)
  - [x] 2.13 **TDD Phase 2**: Implement input sanitization and security measures

- [x] 3.0 Frontend Dashboard Implementation
  - [x] 3.1 Replace default Next.js page with worker vitals dashboard layout (Server Component)
  - [x] 3.2 Create VitalsForm component with heart rate and temperature input fields (Client Component)
  - [x] 3.3 Implement form validation using Zod schemas and proper error handling
  - [x] 3.4 Create VitalsDisplay component to show the last 10 vitals records (Client Component)
  - [x] 3.5 Style components using Tailwind CSS with responsive design
  - [x] 3.6 Implement form submission using server actions with proper loading states and feedback
  - [x] 3.7 Add hardcoded worker ID display and configuration
  - [x] 3.8 Create custom hooks for client-side logic separation (use-vitals-client)
  - [x] 3.9 Implement proper component composition and separation of concerns
  - [x] 3.10 Set up React TanStack Query for client-side data fetching and caching
  - [x] 3.11 Implement API call optimization with 5-second polling interval for real-time updates
  - [x] 3.12 Use useAction hook from next-safe-action for server action interactions
  - [x] 3.13 Create loading.tsx file using skeleton components to enable streaming mode
