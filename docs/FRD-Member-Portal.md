# Functional Requirements Document (FRD)
# GymFlow Pro - Member Portal

**Version:** 1.0
**Date:** January 2026
**Status:** Draft

---

## 1. Executive Summary

The Member Portal is a self-service web application for gym members to manage their membership, book classes, view schedules, make payments, and interact with their gym. Each gym's member portal is branded according to the gym's customization settings.

**Portal URL:** `fitgym.gymflowpro.com/member` or `member.fitgym.gymflowpro.com`

**Related Documents:**
- [FRD-Platform-Admin-Portal.md](./FRD-Platform-Admin-Portal.md) - GymFlow Pro platform management
- [FRD-Gym-Admin-Portal.md](./FRD-Gym-Admin-Portal.md) - Individual gym management

---

## 2. User Roles & Access

### 2.1 Member Portal Roles

| Role | Description | Access |
|------|-------------|--------|
| **MEMBER** | Gym member | Full member portal access |
| **GUEST** | Unregistered visitor | View public class schedule, pricing |

### 2.2 Business Rules - Authentication

| Rule ID | Rule |
|---------|------|
| MAUTH-001 | Members authenticate via email/password or OAuth (Google) |
| MAUTH-002 | Session expires after 30 days (remember me) or 24 hours |
| MAUTH-003 | Failed login attempts (5+) lock account for 15 minutes |
| MAUTH-004 | Password reset via email link (24h expiry) |
| MAUTH-005 | Email verification required for new accounts |
| MAUTH-006 | Member can only access their gym's portal |

---

## 3. Member Portal Modules

### 3.1 Public Pages (No Auth Required)

#### 3.1.1 Landing Page / Home

**Route:** `/` (gym subdomain)

| ID | Requirement | Priority |
|----|-------------|----------|
| PUB-001 | Display gym hero section with branding | High |
| PUB-002 | Display gym features | High |
| PUB-003 | Display membership plans with pricing | High |
| PUB-004 | Display class schedule overview | Medium |
| PUB-005 | Display trainers showcase | Medium |
| PUB-006 | Display testimonials | Medium |
| PUB-007 | Display contact information | High |
| PUB-008 | Display announcements banner | Medium |
| PUB-009 | CTA buttons for signup/login | High |

#### 3.1.2 Class Schedule (Public View)

**Route:** `/schedule`

| ID | Requirement | Priority |
|----|-------------|----------|
| PUB-010 | Display weekly class schedule | High |
| PUB-011 | Filter by class type | Medium |
| PUB-012 | Filter by trainer | Medium |
| PUB-013 | View class details (description, trainer, capacity) | High |
| PUB-014 | Prompt login to book | High |

#### 3.1.3 Pricing Page

**Route:** `/pricing`

| ID | Requirement | Priority |
|----|-------------|----------|
| PUB-015 | Display all active membership plans | High |
| PUB-016 | Highlight featured plan | High |
| PUB-017 | Show plan features comparison | Medium |
| PUB-018 | CTA to signup with selected plan | High |

---

### 3.2 Authentication

#### 3.2.1 Login

**Route:** `/login`

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-001 | Email/password login form | High |
| AUTH-002 | "Remember me" checkbox | Medium |
| AUTH-003 | Forgot password link | High |
| AUTH-004 | Google OAuth login | Medium |
| AUTH-005 | Link to registration | High |
| AUTH-006 | Error messages for invalid credentials | High |

#### 3.2.2 Registration

**Route:** `/register`

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-007 | Registration form (name, email, phone, password) | High |
| AUTH-008 | Optional: Select membership plan during registration | High |
| AUTH-009 | Terms & conditions acceptance | High |
| AUTH-010 | Email verification sent on registration | High |
| AUTH-011 | Google OAuth registration | Medium |
| AUTH-012 | Password strength indicator | Medium |

#### 3.2.3 Registration Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | String | Yes | 2-50 characters |
| Last Name | String | Yes | 2-50 characters |
| Email | Email | Yes | Valid email, unique per gym |
| Phone | String | No | Valid phone format |
| Password | String | Yes | Min 8 chars, 1 uppercase, 1 number |
| Membership Plan | Select | No | Active plans only |

#### 3.2.4 Password Reset

**Route:** `/forgot-password`, `/reset-password`

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-013 | Request password reset via email | High |
| AUTH-014 | Reset link sent to email | High |
| AUTH-015 | Reset link expires in 24 hours | High |
| AUTH-016 | New password form with confirmation | High |
| AUTH-017 | Redirect to login after reset | High |

#### 3.2.5 Business Rules - Registration

| Rule ID | Rule |
|---------|------|
| AUTH-BR-001 | Email must be unique within the gym |
| AUTH-BR-002 | Account created with MEMBER role |
| AUTH-BR-003 | Account status defaults to ACTIVE |
| AUTH-BR-004 | If plan selected, membership created but pending payment |
| AUTH-BR-005 | Welcome email sent on successful registration |

---

### 3.3 Member Dashboard

**Route:** `/member` or `/member/dashboard`

#### 3.3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MDASH-001 | Display welcome message with member name | High |
| MDASH-002 | Display membership status card | High |
| MDASH-003 | Display days remaining in membership | High |
| MDASH-004 | Display upcoming booked classes (next 7 days) | High |
| MDASH-005 | Display recent announcements | Medium |
| MDASH-006 | Quick action: Book a class | High |
| MDASH-007 | Quick action: Renew membership | High |
| MDASH-008 | Display unread notifications count | Medium |
| MDASH-009 | Alert if membership expiring soon | High |
| MDASH-010 | Alert if payment pending | High |

#### 3.3.2 Membership Status Card

| Status | Display | Action |
|--------|---------|--------|
| ACTIVE | Green badge, days remaining | "View Details" |
| EXPIRED | Red badge, "Expired X days ago" | "Renew Now" |
| PAUSED | Yellow badge, pause reason | "Contact Support" |
| CANCELLED | Gray badge | "Rejoin" |
| PENDING | Orange badge | "Complete Payment" |

#### 3.3.3 Business Rules

| Rule ID | Rule |
|---------|------|
| MDASH-BR-001 | Show expiry warning if < 7 days remaining |
| MDASH-BR-002 | Show payment warning if pending payment exists |
| MDASH-BR-003 | Expired members can view dashboard but limited actions |

---

### 3.4 Class Booking

**Route:** `/member/classes`

#### 3.4.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MCLASS-001 | Display weekly class schedule | High |
| MCLASS-002 | Switch between week view and list view | Medium |
| MCLASS-003 | Filter by class type/category | Medium |
| MCLASS-004 | Filter by trainer | Medium |
| MCLASS-005 | Filter by day of week | Medium |
| MCLASS-006 | View class details (description, trainer bio) | High |
| MCLASS-007 | See available spots | High |
| MCLASS-008 | Book class | High |
| MCLASS-009 | Join waitlist if class full | Medium |
| MCLASS-010 | Add to calendar (iCal download) | Low |

#### 3.4.2 Class Card Information

| Element | Description |
|---------|-------------|
| Class Name | e.g., "Morning HIIT" |
| Time | Start - End time |
| Trainer | Trainer name with photo |
| Location | e.g., "Studio A" |
| Spots | "5 spots left" or "Waitlist" |
| Category Badge | e.g., "HIIT", "Yoga" |
| Book Button | "Book Now" or "Join Waitlist" |

#### 3.4.3 Booking Flow

1. Member clicks "Book Now" on class
2. Confirmation modal shows class details
3. Member confirms booking
4. Success message displayed
5. Confirmation email sent
6. Booking appears in "My Bookings"

#### 3.4.4 Business Rules

| Rule ID | Rule |
|---------|------|
| MCLASS-BR-001 | Only active members can book classes |
| MCLASS-BR-002 | Cannot book past classes |
| MCLASS-BR-003 | Cannot book if class is full (waitlist option) |
| MCLASS-BR-004 | Cannot double-book same class on same date |
| MCLASS-BR-005 | Booking confirmation email sent immediately |
| MCLASS-BR-006 | Reminder email sent 24h before class |
| MCLASS-BR-007 | Waitlist member notified if spot opens |

---

### 3.5 My Bookings

**Route:** `/member/bookings`

#### 3.5.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MBOOK-001 | List all bookings (upcoming and past) | High |
| MBOOK-002 | Filter by status (Upcoming, Completed, Cancelled) | High |
| MBOOK-003 | Filter by date range | Medium |
| MBOOK-004 | View booking details | High |
| MBOOK-005 | Cancel upcoming booking | High |
| MBOOK-006 | Rebook cancelled class | Low |
| MBOOK-007 | View booking history | Medium |

#### 3.5.2 Booking Statuses

| Status | Description | Actions |
|--------|-------------|---------|
| CONFIRMED | Upcoming booking | Cancel |
| COMPLETED | Attended class | None |
| CANCELLED | Cancelled by member/admin | Rebook |
| NO_SHOW | Member didn't attend | None |

#### 3.5.3 Business Rules

| Rule ID | Rule |
|---------|------|
| MBOOK-BR-001 | Cancel allowed up to 2 hours before class (configurable) |
| MBOOK-BR-002 | Late cancellation may incur warning |
| MBOOK-BR-003 | 3+ no-shows may result in booking restriction |
| MBOOK-BR-004 | Cancellation opens spot for waitlist |

---

### 3.6 Membership Management

**Route:** `/member/membership`

#### 3.6.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MMEM-001 | View current membership details | High |
| MMEM-002 | View membership plan features | High |
| MMEM-003 | View membership start/end dates | High |
| MMEM-004 | Renew membership | High |
| MMEM-005 | Upgrade/downgrade plan | Medium |
| MMEM-006 | Enable/disable auto-renewal | Medium |
| MMEM-007 | View membership history | Low |
| MMEM-008 | Request membership pause | Low |
| MMEM-009 | Cancel membership | Medium |

#### 3.6.2 Membership Details Display

| Section | Information |
|---------|-------------|
| Plan Name | e.g., "Premium Membership" |
| Status Badge | Active, Expired, etc. |
| Price | ₦50,000/month |
| Started | January 1, 2026 |
| Expires | January 31, 2026 |
| Days Remaining | 15 days |
| Auto-Renew | On/Off toggle |
| Features | List of included features |

#### 3.6.3 Renewal Flow

1. Member clicks "Renew Membership"
2. Current plan pre-selected (can change)
3. Payment summary shown
4. Redirect to payment gateway (Paystack)
5. On success: membership extended
6. Confirmation email sent

#### 3.6.4 Business Rules

| Rule ID | Rule |
|---------|------|
| MMEM-BR-001 | Renewal adds duration to current end date (if active) |
| MMEM-BR-002 | Renewal starts from today if membership expired |
| MMEM-BR-003 | Plan change effective immediately |
| MMEM-BR-004 | Downgrade: No refund, change at next renewal |
| MMEM-BR-005 | Upgrade: Pay difference, effective immediately |
| MMEM-BR-006 | Auto-renew charges 1 day before expiry |
| MMEM-BR-007 | Pause requires admin approval |
| MMEM-BR-008 | Cancellation effective at end of current period |

---

### 3.7 Payments

**Route:** `/member/payments`

#### 3.7.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MPAY-001 | View payment history | High |
| MPAY-002 | Filter by date range | Medium |
| MPAY-003 | Filter by status | Medium |
| MPAY-004 | View payment details | High |
| MPAY-005 | Download receipt/invoice | Medium |
| MPAY-006 | Retry failed payment | High |
| MPAY-007 | View pending payments | High |
| MPAY-008 | Make payment for pending items | High |

#### 3.7.2 Payment History Table

| Column | Description |
|--------|-------------|
| Date | Payment date |
| Description | e.g., "Premium Membership - January 2026" |
| Amount | ₦50,000 |
| Status | Completed, Pending, Failed |
| Receipt | Download link |

#### 3.7.3 Payment Methods

| Method | Description |
|--------|-------------|
| Card | Debit/Credit via Paystack |
| Bank Transfer | Direct bank transfer |
| USSD | USSD payment via Paystack |

#### 3.7.4 Business Rules

| Rule ID | Rule |
|---------|------|
| MPAY-BR-001 | All payments processed via Paystack |
| MPAY-BR-002 | Receipt generated for completed payments |
| MPAY-BR-003 | Failed payment can be retried within 24h |
| MPAY-BR-004 | Pending payment must be completed to activate membership |

---

### 3.8 Personal Training (Optional)

**Route:** `/member/training`

#### 3.8.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MTRAIN-001 | View available trainers | Medium |
| MTRAIN-002 | View trainer profiles and specialties | Medium |
| MTRAIN-003 | Request training session | Medium |
| MTRAIN-004 | View upcoming sessions | Medium |
| MTRAIN-005 | View past sessions with notes | Medium |
| MTRAIN-006 | Cancel upcoming session | Medium |
| MTRAIN-007 | Rate trainer after session | Low |

#### 3.8.2 Business Rules

| Rule ID | Rule |
|---------|------|
| MTRAIN-BR-001 | Session request requires admin/trainer approval |
| MTRAIN-BR-002 | Cancellation within 24h may incur fee |
| MTRAIN-BR-003 | Trainer notes visible to member after session |

---

### 3.9 Profile Settings

**Route:** `/member/profile`

#### 3.9.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MPROF-001 | View profile information | High |
| MPROF-002 | Edit profile (name, phone) | High |
| MPROF-003 | Upload/change profile photo | Medium |
| MPROF-004 | Change email (requires verification) | Medium |
| MPROF-005 | Change password | High |
| MPROF-006 | Manage notification preferences | Medium |
| MPROF-007 | View connected accounts (Google) | Low |
| MPROF-008 | Delete account request | Low |

#### 3.9.2 Profile Fields

| Field | Editable | Notes |
|-------|----------|-------|
| Avatar | Yes | Image upload |
| First Name | Yes | Required |
| Last Name | Yes | Required |
| Email | Yes | Requires verification |
| Phone | Yes | Optional |
| Password | Yes | Requires current password |
| Member Since | No | Display only |

#### 3.9.3 Notification Preferences

| Notification Type | Default | Options |
|-------------------|---------|---------|
| Booking Confirmation | On | On/Off |
| Booking Reminder | On | On/Off |
| Membership Expiry | On | On/Off |
| Payment Receipt | On | On/Off |
| Promotions | Off | On/Off |
| Announcements | On | On/Off |

#### 3.9.4 Business Rules

| Rule ID | Rule |
|---------|------|
| MPROF-BR-001 | Email change sends verification to new email |
| MPROF-BR-002 | Old email notified of email change |
| MPROF-BR-003 | Password change requires current password |
| MPROF-BR-004 | Account deletion is soft delete (data retained) |
| MPROF-BR-005 | Avatar max size 2MB, formats: JPG, PNG |

---

### 3.10 Notifications

**Route:** `/member/notifications`

#### 3.10.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MNOTIF-001 | View all notifications | High |
| MNOTIF-002 | Mark notification as read | High |
| MNOTIF-003 | Mark all as read | Medium |
| MNOTIF-004 | Click notification to navigate | High |
| MNOTIF-005 | Notification bell with unread count | High |
| MNOTIF-006 | Filter by type | Low |

#### 3.10.2 Notification Types

| Type | Example |
|------|---------|
| BOOKING | "Your booking for Morning HIIT is confirmed" |
| MEMBERSHIP | "Your membership expires in 3 days" |
| PAYMENT | "Payment of ₦50,000 received" |
| GENERAL | "The gym will be closed on January 15" |
| PROMO | "50% off personal training this week!" |

---

### 3.11 Contact / Support

**Route:** `/member/contact`

#### 3.11.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MCONT-001 | Display gym contact information | High |
| MCONT-002 | Display gym address with map | Medium |
| MCONT-003 | Display business hours | High |
| MCONT-004 | Contact form for inquiries | High |
| MCONT-005 | Display social media links | Medium |
| MCONT-006 | Live chat (optional, future) | Low |

---

## 4. Mobile Responsiveness

### 4.1 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MOB-001 | Fully responsive design (mobile-first) | High |
| MOB-002 | Touch-friendly buttons (min 44px) | High |
| MOB-003 | Swipe gestures for calendar navigation | Medium |
| MOB-004 | Bottom navigation on mobile | High |
| MOB-005 | Pull-to-refresh on list pages | Medium |
| MOB-006 | Offline indicator | Low |

### 4.2 Mobile Navigation

```
┌─────────────────────────────────────┐
│           [Gym Logo]                │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │     Main Content Area       │    │
│  │                             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  [Home] [Classes] [Bookings] [More] │
└─────────────────────────────────────┘
```

---

## 5. UI/UX Specifications

### 5.1 Design System

- **Framework:** Tailwind CSS + shadcn/ui
- **Theme:** Gym's custom branding (colors from Gym model)
- **Typography:** Inter or system fonts
- **Icons:** Lucide icons

### 5.2 Color Customization

| Element | Source |
|---------|--------|
| Primary Color | gym.primaryColor |
| Secondary Color | gym.secondaryColor |
| Logo | gym.logo |
| Favicon | gym.favicon |

### 5.3 Common Components

| Component | Usage |
|-----------|-------|
| Card | Membership status, class cards |
| Button | Actions (Book, Cancel, etc.) |
| Badge | Status indicators |
| Avatar | Member, trainer photos |
| Calendar | Class schedule |
| Modal | Confirmations, details |
| Toast | Success/error notifications |
| Tabs | Profile sections |
| Form | All input forms |

### 5.4 Loading States

| State | Implementation |
|-------|----------------|
| Page Load | Skeleton loaders |
| Button Action | Spinner + disabled |
| Form Submit | Loading overlay |
| Data Fetch | Shimmer effect |

### 5.5 Empty States

| Page | Empty State Message |
|------|---------------------|
| Bookings | "No upcoming bookings. Book a class to get started!" |
| Payments | "No payment history yet." |
| Notifications | "You're all caught up!" |

---

## 6. API Endpoints

### 6.1 Authentication
- `POST /api/auth/register` - Register new member
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### 6.2 Classes
- `GET /api/member/classes` - List classes with schedule
- `GET /api/member/classes/[scheduleId]` - Get class details

### 6.3 Bookings
- `GET /api/member/bookings` - List member's bookings
- `POST /api/member/bookings` - Create booking
- `PATCH /api/member/bookings/[id]/cancel` - Cancel booking

### 6.4 Membership
- `GET /api/member/membership` - Get current membership
- `POST /api/member/membership/renew` - Initiate renewal
- `PATCH /api/member/membership/auto-renew` - Toggle auto-renew

### 6.5 Payments
- `GET /api/member/payments` - List payments
- `POST /api/member/payments/initialize` - Initialize Paystack payment
- `POST /api/member/payments/verify` - Verify payment

### 6.6 Profile
- `GET /api/member/profile` - Get profile
- `PATCH /api/member/profile` - Update profile
- `POST /api/member/profile/avatar` - Upload avatar
- `PATCH /api/member/profile/password` - Change password

### 6.7 Notifications
- `GET /api/member/notifications` - List notifications
- `PATCH /api/member/notifications/[id]/read` - Mark as read
- `PATCH /api/member/notifications/read-all` - Mark all as read

---

## 7. Email Templates

### 7.1 Transactional Emails

| Email | Trigger | Content |
|-------|---------|---------|
| Welcome | Registration | Welcome message, getting started |
| Email Verification | Registration | Verification link |
| Password Reset | Forgot password | Reset link |
| Booking Confirmation | Class booked | Class details, date/time |
| Booking Reminder | 24h before class | Class details, location |
| Booking Cancelled | Booking cancelled | Cancellation confirmation |
| Payment Receipt | Payment success | Amount, description, receipt |
| Payment Failed | Payment failed | Retry link |
| Membership Expiring | 7 days before | Renewal CTA |
| Membership Expired | Day of expiry | Renewal CTA |
| Membership Renewed | Renewal success | New expiry date |

---

## 8. Implementation Priority

### Phase 1 (MVP)
1. Authentication (Login, Register, Password Reset)
2. Member Dashboard
3. Class Schedule View
4. Class Booking
5. My Bookings
6. Profile Settings (Basic)

### Phase 2
7. Membership Management
8. Payments & Receipts
9. Notifications
10. Profile Settings (Full)

### Phase 3
11. Personal Training
12. Contact/Support
13. Mobile Optimization
14. Offline Support

---

## 9. Analytics & Tracking

### 9.1 Events to Track

| Event | Data |
|-------|------|
| Page View | Page path, member ID |
| Login | Member ID, method (email/OAuth) |
| Registration | Member ID, plan selected |
| Class Booked | Class ID, schedule ID |
| Booking Cancelled | Booking ID, reason |
| Payment Completed | Amount, plan ID |
| Payment Failed | Amount, error |
| Profile Updated | Fields changed |

---

## 10. Accessibility (WCAG 2.1)

| ID | Requirement | Priority |
|----|-------------|----------|
| A11Y-001 | Keyboard navigation support | High |
| A11Y-002 | Screen reader compatibility | High |
| A11Y-003 | Color contrast ratio ≥ 4.5:1 | High |
| A11Y-004 | Focus indicators visible | High |
| A11Y-005 | Alt text for images | High |
| A11Y-006 | Form labels and error messages | High |
| A11Y-007 | Skip navigation link | Medium |

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Claude Code | Initial draft |
