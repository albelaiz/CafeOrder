# Café Direct - Replit Development Guide

## Overview

Café Direct is a QR code-based café ordering system where customers can place orders by scanning QR codes at their tables - no signup or authentication required. The system includes three main interfaces: an anonymous customer ordering flow via QR codes, an authenticated staff dashboard for order management, and an authenticated admin panel for menu management and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo architecture with clear separation between client and server code:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration
- **Real-time Communication**: WebSocket support for live order updates
- **UI Framework**: shadcn/ui components with Tailwind CSS

## Key Components

### Frontend Architecture
- **React Single Page Application** built with Vite for fast development
- **Component-based design** using shadcn/ui components
- **State Management** via React Query for server state and local React state
- **Routing** handled by Wouter for lightweight client-side navigation
- **Real-time Updates** through WebSocket connections

### Backend Architecture
- **Express.js REST API** with TypeScript for type safety
- **Session-based Authentication** using Replit Auth with PostgreSQL session storage
- **Database Layer** using Drizzle ORM for type-safe database operations
- **WebSocket Server** for real-time order status updates
- **Middleware Stack** including logging, error handling, and authentication

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Staff and admin accounts only (customers don't need accounts)
- **Menu Items**: Products with categories (coffee, food, desserts), pricing, and descriptions
- **Orders**: Anonymous orders with status tracking and table assignments (no customer ID required)
- **Order Items**: Individual items within orders with quantities
- **Tables**: Café table management (planned feature)
- **Sessions**: Authentication session storage for staff/admin only

## Data Flow

1. **Customer Journey** (No Authentication Required):
   - Customer scans QR code at table (e.g., /order?t=4)
   - Table number automatically detected from URL
   - Browses menu items filtered by category
   - Adds items to shopping cart
   - Places anonymous order linked to table number
   - Redirected to thank you page
   - Can receive real-time status updates via WebSocket

2. **Staff Workflow**:
   - Staff logs in and views pending orders
   - Updates order status (pending → preparing → ready → completed)
   - Monitors café table status
   - Receives notifications for new orders

3. **Admin Operations**:
   - Manages menu items (create, update, delete)
   - Views order analytics and statistics
   - Manages user accounts and permissions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **express**: Web framework for the backend
- **passport**: Authentication middleware

### UI and Styling
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication
- **Replit Auth**: Integrated OAuth provider
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management

## Deployment Strategy

The application is designed for deployment on Replit with the following build process:

1. **Development Mode**: 
   - Frontend served via Vite dev server with HMR
   - Backend runs with tsx for TypeScript execution
   - Database migrations handled via Drizzle Kit

2. **Production Build**:
   - Frontend built to static assets using Vite
   - Backend compiled with esbuild for Node.js execution
   - Static files served by Express in production

3. **Environment Configuration**:
   - Database connection via `DATABASE_URL` environment variable
   - Session security via `SESSION_SECRET`
   - Replit-specific configuration for auth and domains

## Recent Changes (January 2025)

✓ **Major Architecture Update**: Converted from authenticated customer system to QR code-based ordering
✓ **Database Schema Updated**: Removed customer authentication requirements from orders
✓ **New Customer Flow**: Added anonymous ordering pages (order.tsx, thank-you.tsx, home.tsx)
✓ **Route Restructure**: Separated public routes (/, /order, /thank-you) from protected routes (/staff, /admin)
✓ **Sample Data**: Added seed script with sample menu items and staff accounts
✓ **UI Components**: Created MenuCategory, MenuItem, and Cart components for ordering interface
✓ **Migration Completed**: Successfully migrated from Replit Agent to Replit environment
✓ **Database Integration**: PostgreSQL database provisioned and schema deployed
✓ **QR Code Enhancement**: Added real QR code generation for table management using QR Server API
✓ **Bug Fixes**: Fixed login redirect issues, table creation functionality, and React setState warnings
✓ **Table Management**: Enhanced admin panel with proper QR code display and table creation workflow
✓ **Order Flow**: Orders placed via QR codes are properly linked to table numbers and sent to staff dashboard
✓ **Complete UI Redesign**: Modern, clean interface using shadcn/ui components with professional design
✓ **Excel Export**: Added admin functionality to export orders and menu data as Excel files
✓ **Enhanced Analytics**: Real-time analytics with comprehensive order statistics and popular items
✓ **Mobile-First Design**: Responsive design optimized for customer mobile experience
✓ **Authentication Fixes**: Resolved login credential validation and session management issues
✓ **Menu Item Management**: Fixed delete/edit functionality with proper foreign key handling

The application uses a monorepo structure with shared TypeScript types and utilities, enabling code reuse between client and server while maintaining clear boundaries.