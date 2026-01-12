# Oil & Gas Explorer Hub

A modern React + TypeScript web application for oil and gas exploration, featuring authentication, role-based access control, investor document management, and an admin dashboard.

## Current Status

**Progress**: See [CHECKLIST.md](./CHECKLIST.md) for detailed task tracking.

- **Project Phase**: Production Enhancement (80% → 100%)
- **Technology Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Supabase
- **Original Source**: Created with [Lovable.dev](https://lovable.dev/projects/4d5ff142-a81f-4da5-b4e1-4178857d6f53)

## Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Python 3.8+** - For checklist management (optional)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd oilgas-explorer-hub

# Option 1: Use the setup script (recommended)
./init.sh                    # Linux/Mac/Git Bash
init.bat                     # Windows CMD

# Option 2: Manual setup
npm install
npm run dev

# The app will be available at http://localhost:8080
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Commands

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Build for production
npm run build:dev    # Build with source maps
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure

```
oilgas-explorer-hub/
├── src/
│   ├── components/     # React components
│   │   ├── admin/      # Admin dashboard components
│   │   ├── dashboard/  # User dashboard components
│   │   └── ui/         # shadcn-ui components
│   ├── contexts/       # React contexts (AuthContext)
│   ├── integrations/   # External service integrations
│   │   └── supabase/   # Supabase client and types
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   └── hooks/          # Custom React hooks
├── supabase/
│   └── functions/      # Supabase Edge Functions
├── public/             # Static assets
├── .claude/            # Claude Code plugin config
└── tests/              # Test files (to be added)
```

## Key Features

### Implemented ✅
- **Authentication**: Email/password + Google OAuth via Supabase Auth
- **Role-based Access**: User and Admin roles with protected routes
- **Admin Dashboard**: User management, document management, activity logs
- **Investor Portal**: NDA-gated document access via DocuSign integration
- **Public Pages**: Landing page, About, Services, Portfolio, Contact

### Coming Soon 🚧
- Comprehensive test suite (Vitest + Playwright)
- Global search functionality
- Document versioning
- Two-factor authentication (2FA)
- Enhanced audit trails
- Mobile optimization

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3.1 |
| Language | TypeScript 5.8.3 |
| Build Tool | Vite 5.4.19 |
| Styling | Tailwind CSS 3.4.17 |
| UI Components | shadcn-ui (Radix UI) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| State | React Context + TanStack Query 5.x |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |

## Multi-Session Development

This project uses a Python-based checklist system for tracking work across multiple autonomous agent sessions.

### Checklist Commands

```bash
# Initialize checklist (first time only)
python setup_checklist.py

# View current progress
python checklist_manager.py

# The checklist is stored in:
# - .project_checklist.json (data)
# - CHECKLIST.md (human-readable)
```

### Working with Tasks

```python
from pathlib import Path
from checklist_manager import ChecklistManager

manager = ChecklistManager(Path.cwd())

# Get next task to work on
next_task = manager.get_next_task()

# Update task status
manager.update_task_status(task_id=1, status="In Progress")
manager.update_task_status(task_id=1, status="Done", notes="Completed")

# Export updates to Markdown
manager.export_to_markdown()
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Architecture overview and development patterns
- **[CHECKLIST.md](./CHECKLIST.md)** - Task tracking and progress
- **[app_spec.txt](./app_spec.txt)** - Project specification

## Deployment

### Via Lovable
1. Visit [Lovable Project](https://lovable.dev/projects/4d5ff142-a81f-4da5-b4e1-4178857d6f53)
2. Click Share → Publish

### Via Netlify
The project includes `netlify.toml` for Netlify deployment.

### Via Git
Push changes to trigger CI/CD (GitHub Actions to be configured).

## Contributing

1. Check [CHECKLIST.md](./CHECKLIST.md) for available tasks
2. Follow patterns in [CLAUDE.md](./CLAUDE.md)
3. Run `npm run lint` before committing
4. Update checklist status after completing tasks

## License

Private - All rights reserved.

---

**Questions?** See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.
