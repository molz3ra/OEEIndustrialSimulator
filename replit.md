# OEE-Dash: Industrial Efficiency Simulator

## Overview

OEE-Dash is a full-stack manufacturing efficiency tracking system that simulates real-world factory operations. The application enables shop floor operators to report machine downtime events via a tablet-optimized interface, while managers analyze production losses through comprehensive analytics dashboards. The system focuses on tracking Overall Equipment Effectiveness (OEE), a critical KPI in manufacturing environments.

The application consists of two primary user interfaces:
1. **Shop Floor Operator Interface**: A simplified, tablet-optimized view for reporting LINE DOWN/LINE UP events with downtime reasons and notes
2. **Management Dashboard**: An analytics-focused interface displaying downtime statistics, Pareto analysis, and event histories

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: Radix UI primitives with shadcn/ui components following the "New York" style variant. The design system implements Material Design principles adapted for industrial environments.

**Styling Approach**: Tailwind CSS with a custom configuration emphasizing:
- CSS variables for theming (light/dark mode support)
- Neutral base color scheme (hsl-based color system)
- Custom spacing primitives (4, 6, 8, 12, 16 units)
- Tablet-optimized touch targets (48-64px minimum)

**State Management**: TanStack Query (React Query) for server state management with configured defaults:
- No automatic refetching on window focus
- Infinite stale time
- Custom query functions for API communication

**Routing**: Wouter for lightweight client-side routing with three main routes:
- `/` - Landing page
- `/operator` - Shop floor tablet interface
- `/dashboard` - Management analytics view

**Typography**: Google Fonts CDN loading Roboto (primary) and Roboto Mono (for numerical data display)

**Design Rationale**: Material Design was chosen for its robust patterns for data-rich applications and excellent form design. The tablet-optimized operator interface prioritizes large touch targets and high-contrast visual feedback (red for LINE DOWN, green for LINE UP), while the dashboard emphasizes data density and analytical clarity.

### Backend Architecture

**Runtime**: Node.js with Express.js web framework

**Language**: TypeScript with ES modules

**API Design**: RESTful JSON API with endpoints:
- `POST /api/downtime/start` - Initiate downtime event
- `POST /api/downtime/:id/end` - Complete downtime event
- `GET /api/downtime/active` - Retrieve current active downtime
- `GET /api/downtime/events` - List all downtime events
- `GET /api/downtime/statistics` - Aggregate statistics
- `GET /api/downtime/by-reason` - Grouped analysis by reason

**Business Logic**: Enforces single active downtime constraint—the system prevents starting a new downtime event while another is active. Duration is calculated server-side when events are ended.

**Storage Layer**: Abstracted through an `IStorage` interface with a `DatabaseStorage` implementation, enabling potential storage backend swaps without business logic changes.

**Development Server**: Custom Vite integration in middleware mode for hot module replacement during development. Production builds serve static assets from the `dist/public` directory.

### Data Storage

**Database**: PostgreSQL (configured for Neon serverless)

**ORM**: Drizzle ORM with the Neon serverless driver using WebSocket connections

**Schema Design**: Single table architecture for downtime events with the following structure:
- `id` - Auto-incrementing primary key
- `reason` - Text field for downtime cause
- `notes` - Optional text field for additional details
- `startTime` - Timestamp with automatic default to current time
- `endTime` - Nullable timestamp (null indicates active event)
- `duration` - Calculated integer (in seconds) when event ends

**Schema Validation**: Zod schemas generated from Drizzle schema definitions using `drizzle-zod` for runtime validation of insert operations

**Migration Strategy**: Drizzle Kit for schema migrations with configuration in `drizzle.config.ts`

**Rationale**: PostgreSQL provides robust ACID guarantees critical for manufacturing data integrity. The Neon serverless approach eliminates database infrastructure management. The single-table design is appropriate for the current scope but could be normalized (e.g., separate reason lookup table) as the system scales.

### Authentication & Authorization

**Current Implementation**: None - the system assumes a trusted network environment typical of isolated factory networks

**Future Considerations**: Session-based authentication infrastructure is partially configured (connect-pg-simple for session storage is present in dependencies), indicating readiness for authentication layer addition when deploying beyond isolated networks.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible component primitives (@radix-ui/* packages)
- **Lucide React**: Icon library for consistent iconography
- **date-fns**: Date manipulation and formatting
- **embla-carousel-react**: Carousel/slider functionality
- **cmdk**: Command palette component
- **class-variance-authority & clsx**: Utility-first CSS variant management
- **tailwind-merge**: Tailwind class conflict resolution

### State & Data Management
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Validation resolver integration
- **Zod**: Runtime type validation and schema definition

### Database & Backend
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **Drizzle ORM**: Type-safe SQL query builder
- **ws**: WebSocket client for Neon database connections

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Server-side bundling for production
- **PostCSS & Autoprefixer**: CSS processing
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Build & Deployment
- **Environment**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **Build Process**: Dual build (Vite for client, ESBuild for server) outputting to `dist/` directory
- **Production Server**: Express serving static assets with API routes