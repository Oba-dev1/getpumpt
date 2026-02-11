# Functional Requirements Document (FRD)
# Pumpt - Gym Admin Portal

**Version:** 1.0
**Date:** January 2026
**Status:** Draft

---

## 1. Executive Summary

The Gym Admin Portal is a comprehensive web-based dashboard for gym owners and administrators to manage all aspects of their individual gym operations within the Pumpt multi-tenant platform. This document outlines the functional requirements, business rules, and specifications for each module.

**Portal URL:** `admin.fitgym.getpumpt.com` or `fitgym.getpumpt.com/admin`

**Related Documents:**
- [FRD-Platform-Admin-Portal.md](./FRD-Platform-Admin-Portal.md) - Pumpt platform management
- [FRD-Member-Portal.md](./FRD-Member-Portal.md) - Gym member self-service

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

| Role | Description | Access Level |
|------|-------------|--------------|
| **SUPER_ADMIN** | Platform owner (you) | Full access to all gyms and system settings |
| **ADMIN** | Gym owner/manager | Full access to their gym's admin portal |
| **TRAINER** | Gym staff/trainer | Limited access (schedules, their classes, member info) |
| **MEMBER** | Gym member | No admin access (uses Member Portal) |

### 2.2 Business Rules - Authentication

| Rule ID | Rule |
|---------|------|
| AUTH-001 | Admin must authenticate via email/password or OAuth (Google) |
| AUTH-002 | Session expires after 24 hours of inactivity |
| AUTH-003 | Failed login attempts (5+) lock account for 15 minutes |
| AUTH-004 | Password must be minimum 8 characters with 1 uppercase, 1 number |
| AUTH-005 | SUPER_ADMIN can access any gym's admin portal |
| AUTH-006 | ADMIN can only access their assigned gym |

---

## 3. Admin Portal Modules

### 3.1 Dashboard (Home)

**Route:** `/admin`

#### 3.1.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-001 | Display total active members count | High |
| DASH-002 | Display total revenue (current month) | High |
| DASH-003 | Display new members (current month) | High |
| DASH-004 | Display upcoming class bookings (today) | High |
| DASH-005 | Display membership expiring soon (next 7 days) | Medium |
| DASH-006 | Display recent payments (last 10) | Medium |
| DASH-007 | Display active membership plans breakdown (pie chart) | Medium |
| DASH-008 | Display revenue trend (last 6 months line chart) | Medium |
| DASH-009 | Display quick actions (Add Member, Create Class, etc.) | High |
| DASH-010 | Display pending contact inquiries count | Medium |

#### 3.1.2 Business Rules

| Rule ID | Rule |
|---------|------|
| DASH-BR-001 | Revenue calculations must use completed payments only |
| DASH-BR-002 | "Expiring soon" includes memberships ending within 7 days |
| DASH-BR-003 | All monetary values displayed in gym's default currency (NGN) |
| DASH-BR-004 | Dashboard data should refresh every 5 minutes |

---

### 3.2 Members Management

**Route:** `/admin/members`

#### 3.2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| MEM-001 | List all members with pagination (20 per page) | High |
| MEM-002 | Search members by name, email, phone | High |
| MEM-003 | Filter members by status (Active, Inactive, Suspended) | High |
| MEM-004 | Filter members by membership plan | Medium |
| MEM-005 | Sort members by name, join date, membership expiry | Medium |
| MEM-006 | View member profile with full details | High |
| MEM-007 | Add new member (manual registration) | High |
| MEM-008 | Edit member information | High |
| MEM-009 | Change member status (Activate/Suspend/Deactivate) | High |
| MEM-010 | Assign/change membership plan | High |
| MEM-011 | View member's payment history | Medium |
| MEM-012 | View member's class booking history | Medium |
| MEM-013 | View member's training sessions | Medium |
| MEM-014 | Send notification to member | Medium |
| MEM-015 | Export members list (CSV) | Low |
| MEM-016 | Bulk import members (CSV) | Low |

#### 3.2.2 Member Profile View

| Field | Display | Editable |
|-------|---------|----------|
| Avatar | Yes | Yes |
| First Name | Yes | Yes |
| Last Name | Yes | Yes |
| Email | Yes | Yes |
| Phone | Yes | Yes |
| Status | Yes | Yes (dropdown) |
| Role | Yes | Yes (Admin only) |
| Membership Plan | Yes | Yes (dropdown) |
| Membership Status | Yes | View only |
| Membership Start Date | Yes | View only |
| Membership End Date | Yes | View only |
| Auto-Renew | Yes | Yes (toggle) |
| Join Date | Yes | View only |
| Last Login | Yes | View only |

#### 3.2.3 Business Rules

| Rule ID | Rule |
|---------|------|
| MEM-BR-001 | Email must be unique within the gym |
| MEM-BR-002 | Suspending a member does not cancel their membership |
| MEM-BR-003 | Deactivating a member prevents login but retains data |
| MEM-BR-004 | Deleting a member requires SUPER_ADMIN approval |
| MEM-BR-005 | Membership plan change takes effect immediately |
| MEM-BR-006 | Cannot assign expired membership plan to member |
| MEM-BR-007 | Member with active bookings cannot be deleted |

---

### 3.3 Membership Plans

**Route:** `/admin/membership-plans`

#### 3.3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PLAN-001 | List all membership plans | High |
| PLAN-002 | Create new membership plan | High |
| PLAN-003 | Edit membership plan details | High |
| PLAN-004 | Activate/Deactivate membership plan | High |
| PLAN-005 | Set plan as featured (homepage highlight) | Medium |
| PLAN-006 | Reorder plans (drag & drop sort order) | Medium |
| PLAN-007 | View subscribers count per plan | Medium |
| PLAN-008 | Duplicate existing plan | Low |
| PLAN-009 | Delete plan (if no active subscribers) | Medium |

#### 3.3.2 Plan Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | String | Yes | Max 100 chars, unique per gym |
| Description | Text | No | Max 500 chars |
| Price | Decimal | Yes | Min 0, max 10,000,000 |
| Currency | Enum | Yes | Default: NGN |
| Duration | Integer | Yes | Days (1-365) |
| Features | Array | No | String array, max 10 items |
| Is Active | Boolean | Yes | Default: true |
| Is Featured | Boolean | Yes | Default: false |
| Sort Order | Integer | Yes | Default: 0 |

#### 3.3.3 Business Rules

| Rule ID | Rule |
|---------|------|
| PLAN-BR-001 | Cannot delete plan with active subscribers |
| PLAN-BR-002 | Deactivating plan hides it from public but retains for existing members |
| PLAN-BR-003 | Only one plan can be featured at a time (toggle off others) |
| PLAN-BR-004 | Price changes do not affect existing active memberships |
| PLAN-BR-005 | Plan name must be unique within the gym |
| PLAN-BR-006 | Duration presets: 1 day, 7 days, 30 days, 90 days, 365 days |

---

### 3.4 Classes Management

**Route:** `/admin/classes`

#### 3.4.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| CLASS-001 | List all gym classes | High |
| CLASS-002 | Create new class type | High |
| CLASS-003 | Edit class details | High |
| CLASS-004 | Activate/Deactivate class | High |
| CLASS-005 | Upload class image | Medium |
| CLASS-006 | View class schedules | High |
| CLASS-007 | Delete class (if no schedules) | Medium |

#### 3.4.2 Class Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | String | Yes | Max 100 chars, unique per gym |
| Description | Text | No | Max 1000 chars |
| Duration | Integer | Yes | Minutes (15-180) |
| Capacity | Integer | Yes | Min 1, max 100 |
| Category | Enum | Yes | HIIT, YOGA, STRENGTH, etc. |
| Image URL | String | No | Valid URL |
| Is Active | Boolean | Yes | Default: true |

#### 3.4.3 Business Rules

| Rule ID | Rule |
|---------|------|
| CLASS-BR-001 | Cannot delete class with existing schedules |
| CLASS-BR-002 | Deactivating class also deactivates all its schedules |
| CLASS-BR-003 | Class name must be unique within the gym |
| CLASS-BR-004 | Default capacity inherited by new schedules |

---

### 3.5 Class Schedules

**Route:** `/admin/schedules`

#### 3.5.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SCHED-001 | View weekly schedule calendar | High |
| SCHED-002 | Create new schedule slot | High |
| SCHED-003 | Edit schedule slot | High |
| SCHED-004 | Delete schedule slot | High |
| SCHED-005 | Assign trainer to schedule | High |
| SCHED-006 | Set schedule capacity (override class default) | Medium |
| SCHED-007 | View bookings per schedule | High |
| SCHED-008 | Bulk create recurring schedules | Medium |
| SCHED-009 | Copy week schedule to next week | Low |
| SCHED-010 | Cancel single occurrence | Medium |

#### 3.5.2 Schedule Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Class | Reference | Yes | Active class |
| Trainer | Reference | Yes | Active trainer |
| Day of Week | Enum | Yes | Monday-Sunday |
| Start Time | Time | Yes | HH:mm format |
| End Time | Time | Yes | Must be after start time |
| Max Capacity | Integer | Yes | Min 1, override class default |
| Location | String | No | e.g., "Studio A" |
| Is Active | Boolean | Yes | Default: true |

#### 3.5.3 Business Rules

| Rule ID | Rule |
|---------|------|
| SCHED-BR-001 | Schedule cannot overlap same trainer's other schedules |
| SCHED-BR-002 | End time auto-calculated from class duration |
| SCHED-BR-003 | Cannot delete schedule with future bookings |
| SCHED-BR-004 | Deactivating cancels all future bookings (notify members) |
| SCHED-BR-005 | Trainer must be active to be assigned |
| SCHED-BR-006 | Location conflict warning (same time, same location) |

---

### 3.6 Class Bookings

**Route:** `/admin/bookings`

#### 3.6.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| BOOK-001 | List all bookings with pagination | High |
| BOOK-002 | Filter by date range | High |
| BOOK-003 | Filter by class | Medium |
| BOOK-004 | Filter by status (Confirmed, Cancelled, Completed, No-Show) | High |
| BOOK-005 | Filter by member | Medium |
| BOOK-006 | Create booking on behalf of member | Medium |
| BOOK-007 | Cancel booking | High |
| BOOK-008 | Mark booking as completed | High |
| BOOK-009 | Mark booking as no-show | High |
| BOOK-010 | View booking details | High |
| BOOK-011 | Export bookings report (CSV) | Low |

#### 3.6.2 Business Rules

| Rule ID | Rule |
|---------|------|
| BOOK-BR-001 | Booking cannot exceed schedule capacity |
| BOOK-BR-002 | Member cannot double-book same schedule on same date |
| BOOK-BR-003 | Cancellation sends notification to member |
| BOOK-BR-004 | No-show tracking: 3+ no-shows triggers warning notification |
| BOOK-BR-005 | Completed bookings cannot be cancelled |
| BOOK-BR-006 | Only active members can have bookings created |

---

### 3.7 Trainers Management

**Route:** `/admin/trainers`

#### 3.7.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| TRAIN-001 | List all trainers | High |
| TRAIN-002 | Add new trainer | High |
| TRAIN-003 | Edit trainer profile | High |
| TRAIN-004 | Upload trainer photo | Medium |
| TRAIN-005 | Activate/Deactivate trainer | High |
| TRAIN-006 | View trainer's schedule | Medium |
| TRAIN-007 | View trainer's training sessions | Medium |
| TRAIN-008 | Reorder trainers (sort order for display) | Low |
| TRAIN-009 | Delete trainer | Medium |

#### 3.7.2 Trainer Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | String | Yes | Max 50 chars |
| Last Name | String | Yes | Max 50 chars |
| Email | Email | Yes | Unique per gym |
| Phone | String | No | Valid phone format |
| Bio | Text | No | Max 2000 chars |
| Specialties | Array | No | String array (e.g., "HIIT", "Yoga") |
| Image URL | String | No | Valid URL |
| Certifications | Array | No | String array |
| Years Experience | Integer | No | Min 0 |
| Is Active | Boolean | Yes | Default: true |
| Sort Order | Integer | Yes | Default: 0 |

#### 3.7.3 Business Rules

| Rule ID | Rule |
|---------|------|
| TRAIN-BR-001 | Cannot delete trainer with future scheduled classes |
| TRAIN-BR-002 | Deactivating trainer deactivates their schedules |
| TRAIN-BR-003 | Email must be unique within the gym |
| TRAIN-BR-004 | Trainer can optionally have User account (for login) |

---

### 3.8 Training Sessions (Personal Training)

**Route:** `/admin/training-sessions`

#### 3.8.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SESS-001 | List all training sessions | High |
| SESS-002 | Filter by date range | High |
| SESS-003 | Filter by trainer | Medium |
| SESS-004 | Filter by member | Medium |
| SESS-005 | Filter by status | High |
| SESS-006 | Create new training session | High |
| SESS-007 | Edit training session | High |
| SESS-008 | Cancel training session | High |
| SESS-009 | Mark session as completed | High |
| SESS-010 | Mark session as no-show | Medium |
| SESS-011 | Add session notes | Medium |

#### 3.8.2 Business Rules

| Rule ID | Rule |
|---------|------|
| SESS-BR-001 | Session cannot overlap trainer's class schedule |
| SESS-BR-002 | Member must have active membership |
| SESS-BR-003 | Cancellation within 24 hours may incur penalty (configurable) |
| SESS-BR-004 | Session duration: 30, 45, 60, 90 minutes |

---

### 3.9 Payments & Billing

**Route:** `/admin/payments`

#### 3.9.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-001 | List all payments with pagination | High |
| PAY-002 | Filter by date range | High |
| PAY-003 | Filter by status (Pending, Completed, Failed, Refunded) | High |
| PAY-004 | Filter by member | Medium |
| PAY-005 | View payment details | High |
| PAY-006 | Record manual/cash payment | High |
| PAY-007 | Issue refund | Medium |
| PAY-008 | View payment receipts | Medium |
| PAY-009 | Export payments report (CSV) | Low |
| PAY-010 | View revenue summary by period | Medium |

#### 3.9.2 Payment Fields

| Field | Type | Editable |
|-------|------|----------|
| Member | Reference | Create only |
| Amount | Decimal | Create only |
| Currency | Enum | Create only |
| Status | Enum | Yes (limited) |
| Payment Method | String | Create only |
| Provider | String | Auto (or Manual) |
| Provider Reference | String | Auto |
| Description | Text | Yes |
| Membership | Reference | Create only |

#### 3.9.3 Business Rules

| Rule ID | Rule |
|---------|------|
| PAY-BR-001 | Only completed payments activate/extend membership |
| PAY-BR-002 | Refund requires ADMIN approval |
| PAY-BR-003 | Refund cannot exceed original payment amount |
| PAY-BR-004 | Manual payments must have description |
| PAY-BR-005 | Failed payments can be retried via Paystack |
| PAY-BR-006 | Payment status transitions: Pending→Completed/Failed, Completed→Refunded |

---

### 3.10 Contact Inquiries

**Route:** `/admin/inquiries`

#### 3.10.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| INQ-001 | List all inquiries with pagination | High |
| INQ-002 | Filter by status (New, Contacted, Resolved, Closed) | High |
| INQ-003 | View inquiry details | High |
| INQ-004 | Update inquiry status | High |
| INQ-005 | Add internal notes | Medium |
| INQ-006 | Convert inquiry to member | Medium |
| INQ-007 | Reply via email (integration) | Low |
| INQ-008 | Delete inquiry | Low |

#### 3.10.2 Business Rules

| Rule ID | Rule |
|---------|------|
| INQ-BR-001 | New inquiries trigger admin notification |
| INQ-BR-002 | Status flow: New → Contacted → Resolved/Closed |
| INQ-BR-003 | Cannot delete inquiry with notes |
| INQ-BR-004 | Converting to member creates User with MEMBER role |

---

### 3.11 Testimonials

**Route:** `/admin/testimonials`

#### 3.11.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| TEST-001 | List all testimonials | High |
| TEST-002 | Add new testimonial | High |
| TEST-003 | Edit testimonial | High |
| TEST-004 | Activate/Deactivate testimonial | High |
| TEST-005 | Set as featured | Medium |
| TEST-006 | Reorder testimonials | Medium |
| TEST-007 | Upload testimonial author photo | Medium |
| TEST-008 | Delete testimonial | Medium |

#### 3.11.2 Business Rules

| Rule ID | Rule |
|---------|------|
| TEST-BR-001 | Only active testimonials display on landing page |
| TEST-BR-002 | Featured testimonials appear first/prominently |
| TEST-BR-003 | Rating must be 1-5 stars |

---

### 3.12 Announcements

**Route:** `/admin/announcements`

#### 3.12.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| ANN-001 | List all announcements | High |
| ANN-002 | Create new announcement | High |
| ANN-003 | Edit announcement | High |
| ANN-004 | Activate/Deactivate announcement | High |
| ANN-005 | Pin announcement | Medium |
| ANN-006 | Set announcement type (Info, Warning, Promo, Event, Maintenance) | High |
| ANN-007 | Schedule announcement (start/end date) | Medium |
| ANN-008 | Delete announcement | Medium |

#### 3.12.2 Business Rules

| Rule ID | Rule |
|---------|------|
| ANN-BR-001 | Only active announcements within date range display |
| ANN-BR-002 | Pinned announcements appear first |
| ANN-BR-003 | Warning/Maintenance types display prominently |
| ANN-BR-004 | Expired announcements auto-deactivate |

---

### 3.13 Equipment Management

**Route:** `/admin/equipment`

#### 3.13.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| EQUIP-001 | List all equipment | High |
| EQUIP-002 | Add new equipment | High |
| EQUIP-003 | Edit equipment details | High |
| EQUIP-004 | Update equipment status | High |
| EQUIP-005 | Filter by category | Medium |
| EQUIP-006 | Filter by status (Available, In Use, Maintenance, etc.) | Medium |
| EQUIP-007 | Record maintenance history | Low |
| EQUIP-008 | Delete equipment | Medium |

#### 3.13.2 Business Rules

| Rule ID | Rule |
|---------|------|
| EQUIP-BR-001 | Status transitions: Available ↔ In Use ↔ Maintenance → Out of Order → Retired |
| EQUIP-BR-002 | Maintenance alerts when last maintenance > 90 days |
| EQUIP-BR-003 | Retired equipment hidden from default view |

---

### 3.14 Gym Settings

**Route:** `/admin/settings`

#### 3.14.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SET-001 | Edit gym profile (name, description, tagline) | High |
| SET-002 | Upload logo and favicon | High |
| SET-003 | Set brand colors (primary, secondary) | High |
| SET-004 | Edit contact information | High |
| SET-005 | Edit address information | High |
| SET-006 | Edit social media links | Medium |
| SET-007 | Configure business hours | Medium |
| SET-008 | Edit SEO metadata | Medium |
| SET-009 | Configure landing page content (Hero, About, Features) | High |
| SET-010 | Configure notification preferences | Medium |
| SET-011 | Configure payment settings (Paystack keys) | High |
| SET-012 | View/manage custom domain | Low |

#### 3.14.2 Settings Sections

**General**
- Gym Name, Slug (read-only), Description, Tagline
- Logo, Favicon upload
- Primary Color, Secondary Color (color picker)

**Contact**
- Email, Phone, Website
- Address, City, State, Country

**Social Media**
- Facebook, Instagram, Twitter, YouTube, TikTok URLs

**Business Hours**
- Monday-Sunday open/close times
- Closed days

**SEO**
- Meta Title, Meta Description, Meta Keywords

**Landing Page**
- Hero: Title, Subtitle, CTA Text, CTA Link, Background Image
- About: Title, Description, Image, Stats
- Features: Array of feature cards

**Integrations**
- Paystack Public Key, Secret Key
- Resend API Key

#### 3.14.3 Business Rules

| Rule ID | Rule |
|---------|------|
| SET-BR-001 | Slug cannot be changed after creation |
| SET-BR-002 | Custom domain requires DNS verification |
| SET-BR-003 | Logo/Favicon must be image files (PNG, JPG, SVG) |
| SET-BR-004 | Color picker validates hex color format |
| SET-BR-005 | API keys are encrypted in database |

---

### 3.15 Notifications Center

**Route:** `/admin/notifications`

#### 3.15.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NOTIF-001 | View all admin notifications | High |
| NOTIF-002 | Mark notification as read | High |
| NOTIF-003 | Mark all as read | Medium |
| NOTIF-004 | Filter by type | Medium |
| NOTIF-005 | Notification bell with unread count | High |
| NOTIF-006 | Real-time notification updates | Low |
| NOTIF-007 | Delete old notifications | Low |

#### 3.15.2 Notification Types for Admin

| Type | Trigger |
|------|---------|
| New Member | When member registers |
| New Payment | When payment completed |
| Payment Failed | When payment fails |
| Membership Expiring | 7 days before expiry |
| New Inquiry | When contact form submitted |
| Booking | New class booking |
| No-Show Alert | Multiple member no-shows |

---

### 3.16 Reports & Analytics

**Route:** `/admin/reports`

#### 3.16.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REP-001 | Revenue report (daily, weekly, monthly, yearly) | High |
| REP-002 | Membership report (active, expired, new, churned) | High |
| REP-003 | Class attendance report | Medium |
| REP-004 | Trainer performance report | Medium |
| REP-005 | Member retention report | Medium |
| REP-006 | Export reports (PDF, CSV) | Low |
| REP-007 | Custom date range selection | Medium |
| REP-008 | Comparison with previous period | Low |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-001 | Page load time < 3 seconds |
| NFR-002 | API response time < 500ms |
| NFR-003 | Support 100 concurrent admin users |
| NFR-004 | Dashboard data cached for 5 minutes |

### 4.2 Security

| ID | Requirement |
|----|-------------|
| NFR-005 | All routes require authentication |
| NFR-006 | Role-based access control enforced |
| NFR-007 | CSRF protection on all forms |
| NFR-008 | SQL injection prevention (Prisma ORM) |
| NFR-009 | XSS prevention (React escaping) |
| NFR-010 | Sensitive data encrypted at rest |
| NFR-011 | HTTPS enforced |
| NFR-012 | Audit log for sensitive operations |

### 4.3 Usability

| ID | Requirement |
|----|-------------|
| NFR-013 | Responsive design (desktop, tablet) |
| NFR-014 | Consistent UI with shadcn/ui components |
| NFR-015 | Form validation with clear error messages |
| NFR-016 | Confirmation dialogs for destructive actions |
| NFR-017 | Loading states for async operations |
| NFR-018 | Toast notifications for action feedback |

---

## 5. UI/UX Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Gym Name | Notifications | Profile Menu    │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │              Main Content Area               │
│   Navigation │                                              │
│              │                                              │
│   - Dashboard│                                              │
│   - Members  │                                              │
│   - Plans    │                                              │
│   - Classes  │                                              │
│   - Schedules│                                              │
│   - Bookings │                                              │
│   - Trainers │                                              │
│   - Sessions │                                              │
│   - Payments │                                              │
│   - Inquiries│                                              │
│   - Content  │                                              │
│     - Testi. │                                              │
│     - Announ.│                                              │
│   - Equipment│                                              │
│   - Reports  │                                              │
│   - Settings │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 5.2 Color Scheme

- **Primary:** Gym's primary color (configurable)
- **Secondary:** Gym's secondary color (configurable)
- **Background:** White/Light Gray (#F9FAFB)
- **Sidebar:** Dark (#1F2937) or White (configurable)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Error:** Red (#EF4444)
- **Info:** Blue (#3B82F6)

### 5.3 Common Components

| Component | Usage |
|-----------|-------|
| DataTable | Lists with sorting, filtering, pagination |
| Card | Dashboard stats, content sections |
| Form | All create/edit operations |
| Modal | Quick actions, confirmations |
| Drawer | Mobile navigation, quick views |
| Tabs | Settings sections, profile views |
| Badge | Status indicators |
| Avatar | User/Trainer images |
| Calendar | Schedule view |
| Charts | Dashboard analytics |

---

## 6. API Endpoints (Server Actions)

### 6.1 Members
- `GET /api/admin/members` - List members
- `POST /api/admin/members` - Create member
- `GET /api/admin/members/[id]` - Get member
- `PATCH /api/admin/members/[id]` - Update member
- `DELETE /api/admin/members/[id]` - Delete member

### 6.2 Membership Plans
- `GET /api/admin/plans` - List plans
- `POST /api/admin/plans` - Create plan
- `PATCH /api/admin/plans/[id]` - Update plan
- `DELETE /api/admin/plans/[id]` - Delete plan

### 6.3 Classes
- `GET /api/admin/classes` - List classes
- `POST /api/admin/classes` - Create class
- `PATCH /api/admin/classes/[id]` - Update class
- `DELETE /api/admin/classes/[id]` - Delete class

### 6.4 Schedules
- `GET /api/admin/schedules` - List schedules
- `POST /api/admin/schedules` - Create schedule
- `PATCH /api/admin/schedules/[id]` - Update schedule
- `DELETE /api/admin/schedules/[id]` - Delete schedule

### 6.5 Bookings
- `GET /api/admin/bookings` - List bookings
- `POST /api/admin/bookings` - Create booking
- `PATCH /api/admin/bookings/[id]` - Update booking status

### 6.6 Trainers
- `GET /api/admin/trainers` - List trainers
- `POST /api/admin/trainers` - Create trainer
- `PATCH /api/admin/trainers/[id]` - Update trainer
- `DELETE /api/admin/trainers/[id]` - Delete trainer

### 6.7 Payments
- `GET /api/admin/payments` - List payments
- `POST /api/admin/payments` - Record manual payment
- `POST /api/admin/payments/[id]/refund` - Issue refund

### 6.8 Settings
- `GET /api/admin/settings` - Get gym settings
- `PATCH /api/admin/settings` - Update gym settings

---

## 7. Implementation Priority

### Phase 1 (MVP)
1. Authentication & Authorization
2. Dashboard
3. Members Management
4. Membership Plans
5. Gym Settings (Basic)

### Phase 2
6. Classes Management
7. Class Schedules
8. Trainers Management
9. Bookings

### Phase 3
10. Payments & Billing
11. Training Sessions
12. Contact Inquiries

### Phase 4
13. Testimonials
14. Announcements
15. Equipment
16. Reports & Analytics
17. Notifications Center

---

## 8. Appendix

### 8.1 Status Enums Reference

```typescript
enum UserRole { MEMBER, TRAINER, ADMIN, SUPER_ADMIN }
enum UserStatus { ACTIVE, INACTIVE, SUSPENDED }
enum MembershipStatus { ACTIVE, EXPIRED, CANCELLED, PAUSED }
enum BookingStatus { CONFIRMED, CANCELLED, COMPLETED, NO_SHOW }
enum SessionStatus { SCHEDULED, COMPLETED, CANCELLED, NO_SHOW }
enum PaymentStatus { PENDING, COMPLETED, FAILED, REFUNDED }
enum InquiryStatus { NEW, CONTACTED, RESOLVED, CLOSED }
enum EquipmentStatus { AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_ORDER, RETIRED }
enum AnnouncementType { INFO, WARNING, PROMO, EVENT, MAINTENANCE }
enum NotificationType { MEMBERSHIP, BOOKING, PAYMENT, GENERAL, PROMO }
```

### 8.2 Glossary

| Term | Definition |
|------|------------|
| Gym | A tenant in the multi-tenant system |
| Member | A registered user with MEMBER role |
| Class | A type of group fitness activity |
| Schedule | A recurring time slot for a class |
| Booking | A member's reservation for a specific class occurrence |
| Training Session | One-on-one session between trainer and member |

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Claude Code | Initial draft |
