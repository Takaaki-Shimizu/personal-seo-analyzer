# Personal SEO Analyzer - Tech Stack

## Core Framework
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - Frontend UI library
- **TypeScript 5** - Type-safe JavaScript

## Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework with PostCSS
- **Radix UI** - Headless UI components (@radix-ui/react-dialog, @radix-ui/react-slot)
- **Lucide React** - Icon library

## Backend & Database
- **Supabase** - Backend-as-a-service for database and authentication
- **@supabase/supabase-js** - Supabase client library
- **@supabase/auth-ui-react** - Pre-built auth UI components

## Data Management
- **SWR** - Data fetching library for caching and revalidation
- **Axios** - HTTP client for API requests
- **React Hook Form** - Form state management and validation
- **@hookform/resolvers** - Form validation resolvers

## Development Tools
- **ESLint 9** - Code linting with Next.js configuration
- **PostCSS** - CSS processing
- **Turbopack** - Build tool (used in dev and build scripts)

## File Structure
- **App Router** - Using Next.js 13+ app directory structure
- **TypeScript configuration** with path mapping (@/* for src/*)
- **Modular component structure** with ui/, analysis/, and common/ directories