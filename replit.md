# Café Direct - Replit Development Guide

## Overview

Café Direct is a modern web application that allows café customers to place orders directly from their tables without waiting for servers. The system includes three main interfaces: a customer ordering interface, a staff dashboard for managing orders, and an admin panel for menu and system management.

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
- **Users**: Customer, staff, and admin accounts with role-based access
- **Menu Items**: Products with categories (coffee, food, desserts), pricing, and descriptions
- **Orders**: Customer orders with status tracking and table assignments
- **Order Items**: Individual items within orders with quantities
- **Tables**: Café table management (planned feature)
- **Sessions**: Authentication session storage

## Data Flow

1. **Customer Journey**:
   - Customer authenticates via Replit Auth
   - Browses menu items filtered by category
   - Adds items to shopping cart
   - Places order with table number
   - Receives real-time status updates via WebSocket

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

The application uses a monorepo structure with shared TypeScript types and utilities, enabling code reuse between client and server while maintaining clear boundaries.