# FruitTrade Pro - Weight Recording and Billing System

## Overview

FruitTrade Pro is a comprehensive fruit trading management system designed for wholesale fruit markets. The application manages merchant relationships, weight recording, billing, and provides analytics for fruit trading operations. It supports role-based access with different user types (merchants, company admins, and writers) and provides a complete workflow from weight recording to bill generation and payment tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing without complex configuration overhead
- **State Management**: TanStack Query (React Query) for server state management, providing caching, synchronization, and optimistic updates
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, consistent interface components
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Session Management**: Express sessions with in-memory store for development (MemoryStore)
- **Authentication**: OTP-based phone authentication with role-based access control
- **API Structure**: RESTful endpoints organized by feature (auth, merchants, weight entries, billing)
- **Middleware**: Custom authentication and authorization middleware for protected routes

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL with Neon serverless for scalable cloud hosting
- **Schema Design**: Relational model with users, merchants, fruits, weight entries, bills, and bill items
- **Migrations**: Drizzle Kit for database schema versioning and migrations

### Data Models
- **Users**: Authentication and role management (merchant, company, writer roles)
- **Merchants**: Trader information with commission rates and contact details
- **Fruits**: Product catalog with current pricing
- **Weight Entries**: Transaction records linking merchants, fruits, weights, and amounts
- **Bills**: Aggregated billing with deductions and payment status
- **Bill Items**: Line items within bills for detailed breakdowns

### Authentication & Authorization
- **Authentication Method**: OTP (One-Time Password) sent via phone for secure, passwordless login
- **Session Management**: Server-side sessions with configurable expiration
- **Role-Based Access**: Three user roles with different permission levels
  - Merchants: Limited access to own data
  - Company: Full administrative access
  - Writers: Data entry permissions
- **Route Protection**: Middleware-based authentication checks on API endpoints

### Development & Build
- **Development Server**: Vite dev server with Hot Module Replacement (HMR)
- **Type Checking**: Shared TypeScript configuration across client, server, and shared modules
- **Path Aliases**: Organized imports with @ aliases for cleaner code organization
- **Code Organization**: Monorepo structure with shared schemas and types between frontend and backend

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support for real-time capabilities
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter

### UI & Styling
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Lightweight carousel component for media display

### State Management & Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for form inputs and API responses

### Development Tools
- **Replit Integration**: Development environment integration with runtime error overlays
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins