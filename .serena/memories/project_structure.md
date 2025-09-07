# Personal SEO Analyzer - Project Structure

## Root Directory
```
personal-seo-analyzer/
├── src/                    # Source code
├── public/                 # Static assets
├── .serena/               # Serena configuration
├── .claude/               # Claude configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── eslint.config.mjs      # ESLint configuration
├── next.config.ts         # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── CLAUDE.md              # Claude Code configuration (Japanese)
└── README.md              # Project documentation
```

## Source Structure (`src/`)
```
src/
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   │   ├── search/       # Search functionality
│   │   ├── digital-assets/ # Digital assets analysis
│   │   └── keywords/     # Keyword analysis
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # Reusable UI components (Radix UI)
│   ├── analysis/        # SEO analysis components
│   └── common/          # Common/shared components
├── lib/                 # Utilities and configurations
│   ├── apis/           # API client functions
│   ├── supabase.ts     # Supabase client setup
│   └── utils.ts        # General utilities
└── types/              # TypeScript type definitions
    └── index.ts        # Central type exports
```

## Key Files
- **Authentication**: Supabase integration in `src/lib/supabase.ts`
- **Styling**: Tailwind CSS with global styles in `src/app/globals.css`
- **API Routes**: RESTful endpoints for search, keywords, and digital assets
- **Components**: Modular structure with UI, analysis, and common components

## Development Environment
- **Node.js**: Project uses npm for package management
- **Build Tool**: Turbopack (Next.js default)
- **Development Server**: Runs on localhost:3000 by default