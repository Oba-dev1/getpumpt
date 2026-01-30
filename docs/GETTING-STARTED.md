# Getting Started with FitStudio Gym Management

## Quick Start (3 Steps)

### 1. Database Setup

Apply the schema migration to add all required fields:

```bash
npx prisma migrate dev --name add_user_profile_fields_and_billing
```

This will:
- Create `users` table with profile fields (dateOfBirth, gender, address, emergencyContact)
- Create `membership_plans` table with flexible billing (billingCycle, durationValue, durationType)
- Create all other tables (memberships, classes, bookings, payments, etc.)
- Update your PostgreSQL database schema

### 2. Seed Initial Data

Populate the database with FitStudio gym and test users:

```bash
npx prisma db seed
```

This creates:
- ✅ **FitStudio Gym** - Your gym tenant
- ✅ **3 Membership Plans** - Basic (25k), Premium (45k), VIP (75k)
- ✅ **Admin User** - `admin@fitstudio.ng` / `admin123`
- ✅ **Test Member** - `member@test.com` / `member123`
- ✅ **Sample Classes** - HIIT, Yoga, Spin, Strength, Boxing, CrossFit
- ✅ **Trainers** - 3 sample trainers
- ✅ **Testimonials** - 3 sample reviews

### 3. Start Development Server

```bash
npm run dev
```

Then visit: **http://localhost:3000/admin**

---

## Your Login Credentials

### 🔑 Admin Portal Access

**URL:** `http://localhost:3000/admin`

```
Email: admin@fitstudio.ng
Password: admin123
```

**Permissions:**
- ✅ View dashboard analytics
- ✅ Manage members (CRUD)
- ✅ Manage membership plans
- ✅ Assign memberships
- ✅ View payments & bookings

### 👤 Test Member Account

**URL:** `http://localhost:3000/member` (Phase 3)

```
Email: member@test.com
Password: member123
```

**What members can do (Future):**
- View membership details
- Book classes
- View payment history
- Update profile

---

## What You Can Do Now

### Dashboard (`/admin`)
- 📊 View real-time metrics
  - Total members
  - Monthly revenue
  - New members this month
  - Today's bookings
- 📋 See recent payments
- 📈 View membership breakdown by plan
- ⚠️ Get alerts for expiring memberships

### Members Management (`/admin/members`)

**List Members:**
- Search by name or email
- Filter by status (Active, Inactive, Suspended)
- Pagination (20 per page)
- View member details

**Add New Member:**
- Personal info: name, email, phone, DOB, gender, address
- Emergency contact details
- Create login credentials
- Optionally assign membership plan

**Member Profile:**
- Full personal information
- Current membership with dates
- Recent payment history
- Recent booking history
- Edit or delete member
- Assign/change membership plan

### Membership Plans (`/admin/plans`)

**View Plans:**
- Card grid layout
- Featured plan highlighting
- See subscriber counts
- View plan features
- Activate/deactivate plans

**Create New Plan:**
- Basic info: name, description, price
- Billing cycle: Monthly, Quarterly, Yearly
- Duration: Flexible (e.g., 1 month, 3 months, 1 year)
- Class credits: Optional booking limits
- Features list: Add/remove features
- Settings: Featured flag, active status

**Edit Existing Plan:**
- Update any plan details
- Pre-populated with current data
- Cannot delete plans with active subscribers

---

## Architecture Overview

### Multi-Tenant Structure

```
GymFlowPro Platform (Future Phase)
└─ admin.gymflowpro.com → SUPER_ADMIN
   └─ Manages all gyms on platform

FitStudio Gym (Current)
├─ fitstudio.ng/admin → ADMIN (You)
│  └─ Gym management portal
├─ fitstudio.ng/member → MEMBER
│  └─ Member self-service (Phase 3)
└─ fitstudio.ng → Public
   └─ Marketing landing page
```

### Database Schema

**Key Models:**
- `Gym` - Tenant (FitStudio)
- `User` - Members, admins, trainers
- `MembershipPlan` - Subscription offerings
- `Membership` - Active member subscriptions
- `GymClass` - Class types (HIIT, Yoga, etc.)
- `ClassSchedule` - Weekly schedule
- `ClassBooking` - Member reservations
- `Payment` - Transaction records
- `Trainer` - Gym staff

**Multi-Tenancy:**
- Every query filtered by `gymId`
- Data isolation between gyms
- Email unique per gym (not globally)

### Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** Auth.js v5
- **UI:** Tailwind CSS v4 + shadcn/ui
- **State:** React Hook Form + Zod
- **Deployment:** Vercel (standalone mode)

---

## Development Workflow

### Making Changes

1. **Update Schema:**
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name describe_your_change
   ```

2. **Regenerate Client:**
   ```bash
   npx prisma generate
   ```

3. **Test Build:**
   ```bash
   npx next build
   ```

4. **Run Dev Server:**
   ```bash
   npm run dev
   ```

### Common Tasks

**View Database:**
```bash
npx prisma studio
```

**Reset Database (WARNING: Deletes all data):**
```bash
npx prisma migrate reset
```

**Create New Migration:**
```bash
npx prisma migrate dev --name your_migration_name
```

**Deploy Migrations to Production:**
```bash
npx prisma migrate deploy
```

---

## Testing the System

### Test Flow 1: Add a Member

1. Login as admin: `http://localhost:3000/admin`
2. Go to Members → "Add Member"
3. Fill in the form:
   - Name: Jane Smith
   - Email: jane@test.com
   - Password: password123
   - Phone: +234 800 000 0003
   - Select a plan (optional)
4. Click "Create Member"
5. View member in list
6. Click member to see profile

### Test Flow 2: Create a Membership Plan

1. Go to Plans → "Create Plan"
2. Fill in details:
   - Name: "Student Plan"
   - Price: 15000
   - Billing: Monthly
   - Duration: 1 month
   - Features: Add 2-3 features
   - Mark as active
3. Click "Create Plan"
4. See plan in grid
5. Try editing the plan

### Test Flow 3: Assign Membership

1. Go to Members list
2. Click a member without a plan
3. Click "Assign Plan"
4. Select a plan
5. Choose start date (optional)
6. Confirm
7. See membership details updated

### Test Flow 4: Dashboard Metrics

1. Add a few members
2. Assign memberships
3. Go to Dashboard
4. See metrics update:
   - Total members count
   - New members this month
   - Membership breakdown by plan

---

## Environment Variables

Ensure these are set in `.env.local`:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."      # Pooler URL (port 6543)
DIRECT_URL="postgresql://..."        # Direct URL (port 5432)

# Auth.js
AUTH_SECRET="..."                    # Generate: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Paystack (Phase 2)
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."

# Email (Resend) (Phase 2)
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Project Structure

```
src/
├── app/
│   ├── (admin)/admin/           # Admin portal
│   │   ├── page.tsx             # Dashboard
│   │   ├── members/             # Members management
│   │   └── plans/               # Plans management
│   ├── (marketing)/             # Public marketing site
│   ├── (member)/                # Member portal (Phase 3)
│   └── api/                     # API routes
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── admin/                   # Admin-specific components
│   ├── landing/                 # Marketing components
│   └── member/                  # Member portal components
├── lib/
│   ├── actions/                 # Server actions
│   │   ├── dashboard.ts
│   │   ├── members.ts
│   │   └── plans.ts
│   ├── auth.ts                  # Auth.js config
│   ├── prisma.ts                # Prisma client
│   └── utils.ts                 # Utilities
└── types/                       # TypeScript types

prisma/
├── schema.prisma                # Database schema
├── seed.ts                      # Seed data
└── migrations/                  # Database migrations

docs/
├── GETTING-STARTED.md           # This file
├── LOGIN-CREDENTIALS.md         # Login info
├── PHASE-1-IMPLEMENTATION.md    # What we built
└── FRD-*.md                     # Requirements docs
```

---

## What's Been Fixed

### ✅ Schema Update (Just Completed)

Added missing User fields:
- `dateOfBirth` - For age verification and demographics
- `gender` - For demographics and targeted programs
- `address` - For location services
- `emergencyContact` - Critical for safety
- `emergencyPhone` - Emergency contact number

### ✅ Billing Flexibility

Updated MembershipPlan model:
- `billingCycle` - MONTHLY, QUARTERLY, YEARLY
- `durationValue` - Numeric value (e.g., 1, 3, 12)
- `durationType` - DAYS, MONTHS, YEARS
- `classCredits` - Optional booking limits

### ✅ Authentication Flow

- Seed script creates admin and test users
- Login credentials documented
- Multi-tenant auth working
- Middleware protecting admin routes

### ✅ Build Verification

- TypeScript compilation: ✅ Passed
- Next.js build: ✅ Successful
- All routes generated correctly
- No runtime errors

---

## Troubleshooting

### "Migration failed: relation already exists"

**Solution:** Drop and recreate database:
```bash
npx prisma migrate reset
npx prisma db seed
```

### "Invalid credentials" when logging in

**Check:**
1. Seed script ran successfully
2. Email is exactly: `admin@fitstudio.ng`
3. Password is exactly: `admin123`
4. Check database: `npx prisma studio`

### "Cannot find module '@/lib/actions/...''"

**Solution:** Restart TypeScript server:
- VS Code: `Ctrl+Shift+P` → "Restart TypeScript Server"
- Or restart IDE

### "Property 'gymId' does not exist on type 'User'"

**Solution:** Regenerate Prisma client:
```bash
npx prisma generate
```

### Build fails with type errors

**Solution:**
```bash
# Clean and rebuild
rm -rf .next
rm -rf node_modules/.prisma
npx prisma generate
npx next build
```

### Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

---

## Next Steps

### Immediate (Now)

1. ✅ Run migration: `npx prisma migrate dev`
2. ✅ Seed database: `npx prisma db seed`
3. ✅ Login as admin
4. ✅ Create a membership plan
5. ✅ Add a test member
6. ✅ Explore the dashboard

### Phase 2 (Next)

**Paystack Payment Integration:**
- Setup Paystack account
- Configure API keys
- Implement payment flow
- Add subscription management
- Handle webhooks
- Generate invoices

### Phase 3 (Future)

**Classes & Scheduling:**
- Class schedule management
- Member booking system
- Capacity management
- Waitlist functionality

**Member Portal:**
- Member self-service
- Profile management
- View membership details
- Book classes
- Payment history

**Access Control:**
- Integration with access control devices
- Check-in/check-out tracking
- Access logs

---

## Getting Help

### Documentation

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js Docs](https://authjs.dev)
- [shadcn/ui](https://ui.shadcn.com)

### Project Docs

- [PHASE-1-IMPLEMENTATION.md](./PHASE-1-IMPLEMENTATION.md) - Technical details
- [LOGIN-CREDENTIALS.md](./LOGIN-CREDENTIALS.md) - Access information
- [CLAUDE.md](../CLAUDE.md) - Project configuration
- [README.md](../README.md) - Project overview

### Common Issues

Check existing documentation first:
1. Review troubleshooting section above
2. Check error messages in console
3. Verify environment variables
4. Ensure database is running

---

## Success Checklist

Before moving to Phase 2, verify:

- [ ] Database migration applied successfully
- [ ] Seed script created test data
- [ ] Can login as admin (`admin@fitstudio.ng`)
- [ ] Dashboard shows metrics
- [ ] Can create new membership plan
- [ ] Can add new member
- [ ] Can assign membership to member
- [ ] Member profile shows membership details
- [ ] Can search and filter members
- [ ] Can edit membership plan
- [ ] No console errors
- [ ] Build passes: `npx next build`

---

**Welcome to FitStudio Gym Management! 🏋️**

You're now ready to manage your gym with a modern, type-safe, multi-tenant platform.

**Current Status:** ✅ Phase 1 Complete
**Next Phase:** Paystack Payment Integration
