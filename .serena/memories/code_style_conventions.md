# Personal SEO Analyzer - Code Style & Conventions

## TypeScript Configuration
- **Target**: ES2017
- **Strict mode**: Enabled
- **Path mapping**: `@/*` maps to `./src/*`
- **JSX**: Preserve mode for Next.js processing

## ESLint Configuration
- **Extends**: `next/core-web-vitals` and `next/typescript`
- **Ignored directories**: node_modules, .next, out, build, next-env.d.ts

## File Naming & Structure
- **Components**: Located in `src/components/` with subdirectories:
  - `ui/` - Reusable UI components
  - `analysis/` - SEO analysis specific components  
  - `common/` - Common/shared components
- **API Routes**: Located in `src/app/api/` following Next.js App Router conventions
- **Types**: Centralized in `src/types/index.ts`
- **Utilities**: Located in `src/lib/`

## Code Style Guidelines (from CLAUDE.md)
- **CSS Framework**: Prioritize Tailwind CSS usage, avoid duplicate styles
- **Environment Variables**: Use UPPER_SNAKE_CASE for .env keys, no quotes around values
- **Language**: All responses and comments should be in Japanese (日本語)
- **File Creation**: Check if new files should be added to .gitignore

## Component Structure
- Use functional components with TypeScript
- Follow React 19 patterns and hooks
- Leverage Next.js App Router conventions
- Use Radix UI for headless component patterns