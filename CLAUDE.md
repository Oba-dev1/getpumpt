# GymFlow Pro - Project Configuration

## Project Overview

GymFlow Pro is a multi-tenant SaaS platform for gym management. It enables gym owners to manage members, classes, payments, and more through customizable white-label websites.

### Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** Auth.js v5
- **Payments:** Paystack
- **Email:** Resend
- **State:** TanStack Query, React Hook Form + Zod
- **Deployment:** Vercel

### Architecture

Multi-tenant with subdomain-based routing:
- `gymflowpro.com` - Marketing website
- `admin.gymflowpro.com` - Platform admin (SUPER_ADMIN)
- `fitgym.gymflowpro.com` - Individual gym website
- `fitgym.gymflowpro.com/admin` - Gym admin portal
- `fitgym.gymflowpro.com/member` - Member portal

---

## Critical Rules

### 1. Code Organization

- Many small files over few large files
- High cohesion, low coupling
- 200-400 lines typical, 800 max per file
- Organize by feature/domain in route groups

### 2. Code Style

- No emojis in code, comments, or documentation
- Immutability always - never mutate objects or arrays
- No console.log in production code
- Proper error handling with try/catch
- Input validation with Zod schemas (see `src/lib/validations.ts`)

### 3. Multi-Tenancy

- ALL database queries MUST include `gymId` filter
- Never expose data from one gym to another
- Use `useGym()` hook to get current gym context
- Validate gym access in all API routes

### 4. Testing

- TDD: Write tests first when possible
- 80% minimum coverage target
- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for critical flows (auth, payments, booking)

### 5. Security

- No hardcoded secrets - use environment variables
- Validate all user inputs with Zod
- Parameterized queries only (Prisma handles this)
- CSRF protection enabled
- Role-based access control (RBAC)

---

## File Structure

```
src/
|-- app/
|   |-- (marketing)/     # GymFlow Pro marketing site
|   |-- (gym)/           # Individual gym websites
|   |   |-- gym/[domain]/
|   |-- (member)/        # Member portal
|   |-- (admin)/         # Gym admin portal
|   |-- (platform)/      # Platform admin (SUPER_ADMIN)
|   |-- api/             # API routes
|
|-- components/
|   |-- ui/              # shadcn/ui components
|   |-- marketing/       # Marketing page components
|   |-- admin/           # Admin dashboard components
|   |-- member/          # Member portal components
|
|-- contexts/            # React contexts (GymContext, etc.)
|-- hooks/               # Custom React hooks
|-- lib/                 # Utility libraries
|   |-- prisma.ts        # Prisma client
|   |-- auth.ts          # Auth.js config
|   |-- validations.ts   # Zod schemas
|   |-- utils.ts         # Helper functions
|
|-- types/               # TypeScript definitions

prisma/
|-- schema.prisma        # Database schema
|-- seed.ts              # Seed data

docs/
|-- FRD-*.md             # Functional Requirements Documents
```

---

## Key Patterns

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Server Actions (Preferred over API routes)

```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getMembers(gymId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  // Always filter by gymId for multi-tenancy
  return prisma.user.findMany({
    where: { gymId, role: 'MEMBER' }
  })
}
```

### Zod Validation

```typescript
import { z } from 'zod'

export const memberSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
})

export type MemberInput = z.infer<typeof memberSchema>
```

### React Query Pattern

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useMembers(gymId: string) {
  return useQuery({
    queryKey: ['members', gymId],
    queryFn: () => getMembers(gymId),
  })
}
```

---

## Environment Variables

```bash
# Database (Supabase)
DATABASE_URL=          # Connection pooler URL
DIRECT_URL=            # Direct connection URL

# Auth.js
AUTH_SECRET=           # Generate with: openssl rand -base64 32
AUTH_URL=              # http://localhost:3000

# Paystack
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=

# Email (Resend)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Available Commands

- `/tdd` - Test-driven development workflow
- `/plan` - Create implementation plan
- `/code-review` - Review code quality and security
- `/build-fix` - Fix build errors
- `/e2e` - Generate E2E tests
- `/refactor-clean` - Remove dead code

---

## Database Models

Key models in Prisma schema:

- `Gym` - Tenant (gym business)
- `User` - Users (members, trainers, admins)
- `MembershipPlan` - Subscription plans
- `Membership` - User's active membership
- `GymClass` - Class types (HIIT, Yoga, etc.)
- `ClassSchedule` - Weekly schedule slots
- `Booking` - Class reservations
- `Trainer` - Gym staff
- `Payment` - Transaction records

All models (except platform-level) have `gymId` for multi-tenancy.

---

## Git Workflow

- Branch: `staging` (current development)
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- PRs require review
- All tests must pass before merge
- No force push to staging/main

---

## Deployment

- **Staging:** Vercel (auto-deploy on push to `staging`)
- **Production:** Vercel (auto-deploy on push to `main`)
- **Database:** Supabase PostgreSQL

---

## Documentation

FRDs in `/docs`:
- `FRD-Platform-Admin-Portal.md` - Platform management
- `FRD-Gym-Admin-Portal.md` - Gym owner dashboard
- `FRD-Member-Portal.md` - Member self-service
- `FRD-GymFlow-Marketing-Website.md` - Marketing site
