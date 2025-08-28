# Digital Surprise Sharing Application

## Overview

This is a full-stack web application that allows users to create and share digital surprises containing media files (images/videos) with personalized messages. Users can upload media, add messages, optionally password-protect their surprises, and generate shareable links or QR codes for recipients to access. The application features a festive, celebration-themed UI with confetti animations and floating decorations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Framework**: Radix UI primitives with custom shadcn/ui components for accessible, customizable interfaces
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with proper error handling and request logging middleware
- **File Handling**: Multer for multipart form data and file uploads with memory storage
- **Development Setup**: Vite middleware integration for hot module replacement in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **File Storage**: In-memory storage for files with local filesystem fallback
- **Session Storage**: PostgreSQL session store with connect-pg-simple

### Authentication and Security
- **Password Protection**: Optional bcrypt-style password hashing for surprise access
- **File Validation**: MIME type validation restricting uploads to images and videos only
- **Size Limits**: 50MB file upload limit to prevent abuse
- **Unique Identifiers**: Nanoid for generating URL-safe unique slugs

### External Dependencies
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **QR Code Generation**: QRCode library for generating shareable QR codes
- **Font Loading**: Google Fonts integration for typography
- **Development Tools**: Replit-specific plugins for enhanced development experience
- **UI Components**: Extensive Radix UI component library for accessibility
- **Date Handling**: date-fns for date manipulation and formatting
- **Class Management**: clsx and tailwind-merge for conditional styling
- **Icons**: Lucide React for consistent iconography