# Functional Requirements Document (FRD)
# GymFlow Pro - Platform Admin Portal

**Version:** 1.0
**Date:** January 2026
**Status:** Draft

---

## 1. Executive Summary

The Platform Admin Portal is the central management hub for GymFlow Pro SaaS platform owners (SUPER_ADMIN). This portal provides complete oversight and control over all tenant gyms, platform subscriptions, revenue, support, and system configuration.

**Portal URL:** `admin.gymflowpro.com`

**Related Documents:**
- [FRD-Gym-Admin-Portal.md](./FRD-Gym-Admin-Portal.md) - Individual gym management
- [FRD-Member-Portal.md](./FRD-Member-Portal.md) - Gym member self-service

---

## 2. User Roles & Access

### 2.1 Platform Roles

| Role | Description | Access |
|------|-------------|--------|
| **SUPER_ADMIN** | Platform owner (you) | Full platform access |
| **PLATFORM_SUPPORT** | Support staff | Read access + support actions |
| **PLATFORM_BILLING** | Billing admin | Subscription & payment access |

### 2.2 Business Rules - Authentication

| Rule ID | Rule |
|---------|------|
| PAUTH-001 | Platform admin must use 2FA (Two-Factor Authentication) |
| PAUTH-002 | Session expires after 8 hours of inactivity |
| PAUTH-003 | Failed login attempts (3+) lock account for 30 minutes |
| PAUTH-004 | All actions logged to audit trail |
| PAUTH-005 | IP whitelist optional for enhanced security |
| PAUTH-006 | Password reset requires email + 2FA verification |

---

## 3. Platform Admin Modules

### 3.1 Platform Dashboard

**Route:** `/platform`

#### 3.1.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PDASH-001 | Display total active gyms count | High |
| PDASH-002 | Display total gyms by subscription tier | High |
| PDASH-003 | Display Monthly Recurring Revenue (MRR) | High |
| PDASH-004 | Display Annual Recurring Revenue (ARR) | High |
| PDASH-005 | Display new gyms (current month) | High |
| PDASH-006 | Display churned gyms (current month) | High |
| PDASH-007 | Display total members across all gyms | Medium |
| PDASH-008 | Display revenue trend chart (last 12 months) | Medium |
| PDASH-009 | Display gym growth chart (last 12 months) | Medium |
| PDASH-010 | Display recent gym signups (last 10) | Medium |
| PDASH-011 | Display pending support tickets count | High |
| PDASH-012 | Display subscription renewals due (next 7 days) | Medium |
| PDASH-013 | Display failed payment alerts | High |
| PDASH-014 | Display top gyms by revenue | Low |
| PDASH-015 | Display top gyms by member count | Low |

#### 3.1.2 Key Metrics Cards

| Metric | Calculation |
|--------|-------------|
| MRR | Sum of all active monthly subscription fees |
| ARR | MRR × 12 |
| Churn Rate | (Cancelled gyms / Total gyms at start) × 100 |
| Average Revenue Per Gym | Total revenue / Active gyms |
| Customer Lifetime Value | Average subscription × Average lifespan |

#### 3.1.3 Business Rules

| Rule ID | Rule |
|---------|------|
| PDASH-BR-001 | MRR excludes gyms in trial period |
| PDASH-BR-002 | Churned = gyms cancelled or expired in period |
| PDASH-BR-003 | All monetary values in platform currency (NGN/USD) |
| PDASH-BR-004 | Dashboard data cached for 15 minutes |

---

### 3.2 Gyms Management

**Route:** `/platform/gyms`

#### 3.2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PGYM-001 | List all gyms with pagination (25 per page) | High |
| PGYM-002 | Search gyms by name, slug, email, domain | High |
| PGYM-003 | Filter by status (Active, Trial, Suspended, Cancelled) | High |
| PGYM-004 | Filter by subscription tier | High |
| PGYM-005 | Filter by date range (created) | Medium |
| PGYM-006 | Sort by name, created date, revenue, member count | Medium |
| PGYM-007 | View gym details | High |
| PGYM-008 | Create new gym (manual onboarding) | High |
| PGYM-009 | Edit gym information | High |
| PGYM-010 | Suspend gym | High |
| PGYM-011 | Reactivate suspended gym | High |
| PGYM-012 | Cancel/Terminate gym | High |
| PGYM-013 | Delete gym (soft delete) | Medium |
| PGYM-014 | Impersonate gym admin (login as) | Medium |
| PGYM-015 | View gym's revenue history | Medium |
| PGYM-016 | View gym's member count history | Low |
| PGYM-017 | Export gyms list (CSV) | Low |
| PGYM-018 | Assign/change subscription tier | High |
| PGYM-019 | Extend trial period | Medium |
| PGYM-020 | Apply discount/coupon | Medium |

#### 3.2.2 Gym Detail View

| Section | Fields |
|---------|--------|
| **Basic Info** | Name, Slug, Custom Domain, Logo, Status |
| **Contact** | Owner Name, Email, Phone, Address |
| **Subscription** | Tier, Start Date, Next Billing, Amount |
| **Statistics** | Members, Classes, Trainers, Revenue (their revenue) |
| **Billing History** | Platform subscription payments |
| **Activity** | Last login, Recent actions |
| **Notes** | Internal notes by support |

#### 3.2.3 Gym Statuses

| Status | Description |
|--------|-------------|
| **TRIAL** | New gym in trial period (14 days default) |
| **ACTIVE** | Paid subscription, fully operational |
| **PAST_DUE** | Payment failed, grace period |
| **SUSPENDED** | Suspended by platform (non-payment or violation) |
| **CANCELLED** | Gym cancelled subscription |
| **DELETED** | Soft deleted, data retained |

#### 3.2.4 Business Rules

| Rule ID | Rule |
|---------|------|
| PGYM-BR-001 | Slug must be unique and URL-safe |
| PGYM-BR-002 | Custom domain requires DNS verification |
| PGYM-BR-003 | Suspending gym blocks all admin/member access |
| PGYM-BR-004 | Suspended gyms have 30 days before data purge |
| PGYM-BR-005 | Impersonation logs the action with timestamp |
| PGYM-BR-006 | Trial extension max 14 additional days |
| PGYM-BR-007 | Cancellation effective at end of billing period |
| PGYM-BR-008 | Gym owner notified of all status changes |

---

### 3.3 Subscription Plans (Platform Tiers)

**Route:** `/platform/subscription-plans`

#### 3.3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PSUB-001 | List all subscription tiers | High |
| PSUB-002 | Create new subscription tier | High |
| PSUB-003 | Edit subscription tier | High |
| PSUB-004 | Activate/Deactivate tier | High |
| PSUB-005 | Set feature limits per tier | High |
| PSUB-006 | View subscribers per tier | Medium |
| PSUB-007 | Set pricing (monthly/annual) | High |
| PSUB-008 | Configure trial period | Medium |

#### 3.3.2 Subscription Tier Fields

| Field | Type | Description |
|-------|------|-------------|
| Name | String | e.g., "Starter", "Professional", "Enterprise" |
| Slug | String | URL-safe identifier |
| Monthly Price | Decimal | Monthly subscription fee |
| Annual Price | Decimal | Annual subscription fee (discount) |
| Trial Days | Integer | Free trial duration (default 14) |
| Is Active | Boolean | Available for new signups |
| Is Featured | Boolean | Highlight on pricing page |
| Sort Order | Integer | Display order |

#### 3.3.3 Feature Limits per Tier

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Max Members | 100 | 500 | Unlimited |
| Max Trainers | 3 | 10 | Unlimited |
| Max Classes | 10 | 50 | Unlimited |
| Custom Domain | No | Yes | Yes |
| White Label | No | No | Yes |
| API Access | No | Limited | Full |
| Priority Support | No | Email | Phone + Email |
| Analytics | Basic | Advanced | Advanced |
| Integrations | None | Standard | Premium |

#### 3.3.4 Business Rules

| Rule ID | Rule |
|---------|------|
| PSUB-BR-001 | Cannot delete tier with active subscribers |
| PSUB-BR-002 | Price changes affect only new subscriptions |
| PSUB-BR-003 | Downgrade checks feature limits before applying |
| PSUB-BR-004 | Annual pricing typically 2 months free |
| PSUB-BR-005 | At least one tier must be active |

---

### 3.4 Platform Revenue & Billing

**Route:** `/platform/billing`

#### 3.4.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PBILL-001 | View all platform revenue | High |
| PBILL-002 | Filter by date range | High |
| PBILL-003 | Filter by gym | Medium |
| PBILL-004 | Filter by subscription tier | Medium |
| PBILL-005 | Filter by payment status | High |
| PBILL-006 | View payment details | High |
| PBILL-007 | Issue refund | Medium |
| PBILL-008 | Record manual payment | Medium |
| PBILL-009 | View revenue by tier breakdown | Medium |
| PBILL-010 | Export revenue report (CSV) | Low |
| PBILL-011 | View failed payments | High |
| PBILL-012 | Retry failed payment | Medium |
| PBILL-013 | Generate invoice | Medium |
| PBILL-014 | Send payment reminder | Medium |

#### 3.4.2 Platform Payment Fields

| Field | Description |
|-------|-------------|
| ID | Unique payment identifier |
| Gym | Gym that made payment |
| Amount | Payment amount |
| Currency | NGN/USD |
| Status | Pending, Completed, Failed, Refunded |
| Type | Subscription, Upgrade, Add-on |
| Period | Billing period covered |
| Provider | Paystack, Bank Transfer, etc. |
| Provider Ref | Payment gateway reference |
| Invoice Number | Auto-generated invoice # |
| Created At | Payment date |

#### 3.4.3 Business Rules

| Rule ID | Rule |
|---------|------|
| PBILL-BR-001 | Failed payments retry automatically (3 attempts) |
| PBILL-BR-002 | After 3 failures, gym status → PAST_DUE |
| PBILL-BR-003 | 7 days grace period before suspension |
| PBILL-BR-004 | Refund available within 30 days |
| PBILL-BR-005 | Prorated refund for mid-cycle cancellation |
| PBILL-BR-006 | Invoice generated for all completed payments |

---

### 3.5 Coupons & Discounts

**Route:** `/platform/coupons`

#### 3.5.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PCOUP-001 | List all coupons | High |
| PCOUP-002 | Create new coupon | High |
| PCOUP-003 | Edit coupon | High |
| PCOUP-004 | Activate/Deactivate coupon | High |
| PCOUP-005 | Set discount type (percentage/fixed) | High |
| PCOUP-006 | Set usage limits | Medium |
| PCOUP-007 | Set validity period | Medium |
| PCOUP-008 | Restrict to specific tiers | Medium |
| PCOUP-009 | View coupon usage history | Medium |
| PCOUP-010 | Delete coupon | Low |

#### 3.5.2 Coupon Fields

| Field | Type | Description |
|-------|------|-------------|
| Code | String | Unique coupon code |
| Name | String | Internal name |
| Discount Type | Enum | PERCENTAGE, FIXED_AMOUNT |
| Discount Value | Decimal | % off or fixed amount |
| Max Uses | Integer | Total uses allowed (null = unlimited) |
| Uses Per Gym | Integer | Uses per gym (usually 1) |
| Valid From | DateTime | Start date |
| Valid Until | DateTime | Expiry date |
| Applicable Tiers | Array | Which tiers it applies to |
| First Payment Only | Boolean | Only for first payment |
| Is Active | Boolean | Currently active |

#### 3.5.3 Business Rules

| Rule ID | Rule |
|---------|------|
| PCOUP-BR-001 | Coupon code must be unique |
| PCOUP-BR-002 | Percentage discount max 100% |
| PCOUP-BR-003 | Fixed discount cannot exceed plan price |
| PCOUP-BR-004 | Expired coupons auto-deactivate |
| PCOUP-BR-005 | Usage count tracked per coupon |

---

### 3.6 Support & Tickets

**Route:** `/platform/support`

#### 3.6.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PSUP-001 | List all support tickets | High |
| PSUP-002 | Filter by status (Open, In Progress, Resolved, Closed) | High |
| PSUP-003 | Filter by priority (Low, Medium, High, Urgent) | High |
| PSUP-004 | Filter by gym | Medium |
| PSUP-005 | Filter by category | Medium |
| PSUP-006 | View ticket details | High |
| PSUP-007 | Reply to ticket | High |
| PSUP-008 | Update ticket status | High |
| PSUP-009 | Assign ticket to support staff | Medium |
| PSUP-010 | Escalate ticket | Medium |
| PSUP-011 | Add internal notes | Medium |
| PSUP-012 | Create ticket on behalf of gym | Low |
| PSUP-013 | View ticket history/timeline | Medium |
| PSUP-014 | Set up auto-responses | Low |

#### 3.6.2 Ticket Categories

| Category | Description |
|----------|-------------|
| BILLING | Payment, subscription, refund issues |
| TECHNICAL | Bugs, errors, feature questions |
| ACCOUNT | Login, access, settings |
| FEATURE_REQUEST | New feature suggestions |
| GENERAL | Other inquiries |

#### 3.6.3 Business Rules

| Rule ID | Rule |
|---------|------|
| PSUP-BR-001 | New tickets notify platform support |
| PSUP-BR-002 | Urgent tickets escalate automatically after 2 hours |
| PSUP-BR-003 | SLA: Response within 24h (standard), 4h (urgent) |
| PSUP-BR-004 | Closed tickets reopen if gym replies |
| PSUP-BR-005 | Satisfaction survey sent on ticket close |

---

### 3.7 Platform Users (Staff)

**Route:** `/platform/users`

#### 3.7.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PUSER-001 | List all platform staff | High |
| PUSER-002 | Add new platform staff | High |
| PUSER-003 | Edit staff profile | High |
| PUSER-004 | Assign platform role | High |
| PUSER-005 | Activate/Deactivate staff | High |
| PUSER-006 | Reset staff password | Medium |
| PUSER-007 | Enable/Disable 2FA | Medium |
| PUSER-008 | View staff activity log | Medium |
| PUSER-009 | Remove staff | Medium |

#### 3.7.2 Business Rules

| Rule ID | Rule |
|---------|------|
| PUSER-BR-001 | At least one SUPER_ADMIN must exist |
| PUSER-BR-002 | Cannot deactivate yourself |
| PUSER-BR-003 | 2FA required for SUPER_ADMIN |
| PUSER-BR-004 | All actions logged with user ID |

---

### 3.8 Audit Logs

**Route:** `/platform/audit-logs`

#### 3.8.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PAUDIT-001 | View all audit logs | High |
| PAUDIT-002 | Filter by date range | High |
| PAUDIT-003 | Filter by user (staff) | Medium |
| PAUDIT-004 | Filter by action type | Medium |
| PAUDIT-005 | Filter by resource (gym, payment, etc.) | Medium |
| PAUDIT-006 | Search by details | Low |
| PAUDIT-007 | Export audit logs | Low |

#### 3.8.2 Logged Actions

| Action | Description |
|--------|-------------|
| LOGIN | Staff login |
| LOGOUT | Staff logout |
| GYM_CREATE | New gym created |
| GYM_UPDATE | Gym details updated |
| GYM_SUSPEND | Gym suspended |
| GYM_CANCEL | Gym cancelled |
| GYM_IMPERSONATE | Admin impersonated gym |
| PAYMENT_REFUND | Refund issued |
| SUBSCRIPTION_CHANGE | Plan tier changed |
| COUPON_CREATE | Coupon created |
| SETTINGS_UPDATE | Platform settings changed |

#### 3.8.3 Business Rules

| Rule ID | Rule |
|---------|------|
| PAUDIT-BR-001 | Logs retained for 2 years |
| PAUDIT-BR-002 | Logs are immutable (no delete) |
| PAUDIT-BR-003 | Sensitive data masked in logs |

---

### 3.9 Platform Settings

**Route:** `/platform/settings`

#### 3.9.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PSET-001 | Edit platform branding (logo, name, colors) | High |
| PSET-002 | Configure default trial period | High |
| PSET-003 | Configure payment gateway (Paystack) | High |
| PSET-004 | Configure email settings (Resend) | High |
| PSET-005 | Configure notification templates | Medium |
| PSET-006 | Set platform currency | High |
| PSET-007 | Configure support email | High |
| PSET-008 | Set terms of service URL | Medium |
| PSET-009 | Set privacy policy URL | Medium |
| PSET-010 | Configure maintenance mode | Low |
| PSET-011 | Set default gym limits | Medium |
| PSET-012 | Configure webhook URLs | Low |

#### 3.9.2 Settings Sections

**General**
- Platform Name: "GymFlow Pro"
- Logo, Favicon
- Primary Color, Secondary Color
- Support Email
- Legal URLs (Terms, Privacy)

**Billing**
- Default Currency
- Paystack Public Key
- Paystack Secret Key
- Payment Retry Settings
- Grace Period (days)

**Emails**
- Resend API Key
- From Email Address
- Email Templates (Welcome, Payment, etc.)

**Defaults**
- Trial Period (days)
- Default Tier for New Signups
- Default Feature Limits

**Maintenance**
- Maintenance Mode (on/off)
- Maintenance Message
- Whitelist IPs during maintenance

---

### 3.10 Platform Analytics & Reports

**Route:** `/platform/analytics`

#### 3.10.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PANA-001 | Revenue dashboard | High |
| PANA-002 | Gym growth report | High |
| PANA-003 | Churn analysis | Medium |
| PANA-004 | Subscription tier distribution | Medium |
| PANA-005 | Geographic distribution | Low |
| PANA-006 | Feature usage analytics | Low |
| PANA-007 | Cohort analysis | Low |
| PANA-008 | Export all reports | Low |

#### 3.10.2 Revenue Reports

| Report | Description |
|--------|-------------|
| MRR Trend | Monthly recurring revenue over time |
| Revenue by Tier | Breakdown by subscription tier |
| Revenue by Month | Monthly revenue comparison |
| ARPU | Average revenue per user (gym) |
| LTV | Customer lifetime value |

#### 3.10.3 Growth Reports

| Report | Description |
|--------|-------------|
| New Gyms | New signups over time |
| Conversion Rate | Trial to paid conversion |
| Churn Rate | Cancellation rate |
| Net Growth | New - Churned |
| Active Gyms | Active gym count over time |

---

### 3.11 Email Campaigns (Optional)

**Route:** `/platform/campaigns`

#### 3.11.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PCAMP-001 | Create email campaign | Low |
| PCAMP-002 | Select target audience | Low |
| PCAMP-003 | Schedule campaign | Low |
| PCAMP-004 | View campaign statistics | Low |
| PCAMP-005 | A/B testing | Low |

---

### 3.12 System Health

**Route:** `/platform/health`

#### 3.12.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PHEALTH-001 | View system status | Medium |
| PHEALTH-002 | Database connection status | Medium |
| PHEALTH-003 | Payment gateway status | Medium |
| PHEALTH-004 | Email service status | Medium |
| PHEALTH-005 | View error logs | Medium |
| PHEALTH-006 | View performance metrics | Low |

---

## 4. Database Schema Additions

### 4.1 Platform-Level Models

```prisma
// Platform Subscription Tiers
model SubscriptionTier {
  id            String   @id @default(cuid())
  name          String   // e.g., "Starter", "Professional"
  slug          String   @unique
  monthlyPrice  Decimal  @db.Decimal(10, 2)
  annualPrice   Decimal  @db.Decimal(10, 2)
  trialDays     Int      @default(14)
  features      Json     // Feature limits
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  subscriptions GymSubscription[]

  @@map("subscription_tiers")
}

// Gym Subscription (what gyms pay to platform)
model GymSubscription {
  id            String   @id @default(cuid())
  gymId         String   @unique
  tierId        String
  status        GymSubscriptionStatus @default(TRIAL)
  billingCycle  BillingCycle @default(MONTHLY)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  trialEndsAt   DateTime?
  cancelledAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  gym           Gym      @relation(fields: [gymId], references: [id])
  tier          SubscriptionTier @relation(fields: [tierId], references: [id])
  payments      PlatformPayment[]

  @@map("gym_subscriptions")
}

enum GymSubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  SUSPENDED
  CANCELLED
}

enum BillingCycle {
  MONTHLY
  ANNUAL
}

// Platform Payments (from gyms to platform)
model PlatformPayment {
  id              String   @id @default(cuid())
  subscriptionId  String
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("NGN")
  status          PaymentStatus @default(PENDING)
  providerRef     String?  @unique
  invoiceNumber   String?  @unique
  periodStart     DateTime
  periodEnd       DateTime
  createdAt       DateTime @default(now())

  subscription    GymSubscription @relation(fields: [subscriptionId], references: [id])

  @@map("platform_payments")
}

// Coupons
model Coupon {
  id            String   @id @default(cuid())
  code          String   @unique
  name          String
  discountType  DiscountType
  discountValue Decimal  @db.Decimal(10, 2)
  maxUses       Int?
  usesPerGym    Int      @default(1)
  currentUses   Int      @default(0)
  validFrom     DateTime?
  validUntil    DateTime?
  applicableTiers String[] // tier IDs
  firstPaymentOnly Boolean @default(true)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  @@map("coupons")
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

// Support Tickets
model SupportTicket {
  id          String   @id @default(cuid())
  gymId       String
  subject     String
  category    TicketCategory
  priority    TicketPriority @default(MEDIUM)
  status      TicketStatus @default(OPEN)
  assignedTo  String?  // Platform staff ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  gym         Gym      @relation(fields: [gymId], references: [id])
  messages    TicketMessage[]

  @@map("support_tickets")
}

model TicketMessage {
  id          String   @id @default(cuid())
  ticketId    String
  senderId    String   // User or staff ID
  senderType  SenderType
  message     String   @db.Text
  isInternal  Boolean  @default(false)
  createdAt   DateTime @default(now())

  ticket      SupportTicket @relation(fields: [ticketId], references: [id])

  @@map("ticket_messages")
}

enum TicketCategory {
  BILLING
  TECHNICAL
  ACCOUNT
  FEATURE_REQUEST
  GENERAL
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum SenderType {
  GYM_ADMIN
  PLATFORM_STAFF
}

// Audit Logs
model AuditLog {
  id          String   @id @default(cuid())
  userId      String   // Staff who performed action
  action      String   // Action type
  resource    String   // Resource type (gym, payment, etc.)
  resourceId  String?  // ID of affected resource
  details     Json?    // Additional details
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}

// Platform Users (Staff)
model PlatformUser {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          PlatformRole @default(PLATFORM_SUPPORT)
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret String?
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("platform_users")
}

enum PlatformRole {
  SUPER_ADMIN
  PLATFORM_SUPPORT
  PLATFORM_BILLING
}

// Platform Settings
model PlatformSettings {
  id            String   @id @default("default")
  name          String   @default("GymFlow Pro")
  logo          String?
  favicon       String?
  primaryColor  String   @default("#6366F1")
  secondaryColor String  @default("#818CF8")
  supportEmail  String?
  termsUrl      String?
  privacyUrl    String?
  defaultTrialDays Int   @default(14)
  defaultTierId String?
  currency      String   @default("NGN")
  maintenanceMode Boolean @default(false)
  maintenanceMessage String?
  paystackPublicKey String?
  paystackSecretKey String?
  resendApiKey  String?
  updatedAt     DateTime @updatedAt

  @@map("platform_settings")
}
```

---

## 5. UI/UX Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: GymFlow Pro Logo | Search | Notifications | Profile    │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│    Sidebar     │               Main Content Area                │
│                │                                                │
│  - Dashboard   │                                                │
│  - Gyms        │                                                │
│  - Subscriptions│                                               │
│  - Billing     │                                                │
│  - Coupons     │                                                │
│  - Support     │                                                │
│  - Staff       │                                                │
│  - Audit Logs  │                                                │
│  - Analytics   │                                                │
│  - Settings    │                                                │
│  - Health      │                                                │
│                │                                                │
└────────────────┴────────────────────────────────────────────────┘
```

### 5.2 Color Scheme

- **Primary:** Indigo (#6366F1) - Platform brand
- **Secondary:** Purple (#818CF8)
- **Background:** Slate Gray (#0F172A) - Dark theme default
- **Success:** Emerald (#10B981)
- **Warning:** Amber (#F59E0B)
- **Error:** Rose (#F43F5E)
- **Info:** Sky (#0EA5E9)

---

## 6. Implementation Priority

### Phase 1 (MVP)
1. Platform Authentication (2FA)
2. Platform Dashboard
3. Gyms Management (list, view, create)
4. Basic Subscription Management

### Phase 2
5. Platform Billing & Payments
6. Support Tickets
7. Coupons & Discounts

### Phase 3
8. Platform Staff Management
9. Audit Logs
10. Platform Settings

### Phase 4
11. Analytics & Reports
12. Email Campaigns
13. System Health

---

## 7. API Endpoints

### 7.1 Platform Auth
- `POST /api/platform/auth/login`
- `POST /api/platform/auth/logout`
- `POST /api/platform/auth/2fa/verify`

### 7.2 Gyms
- `GET /api/platform/gyms`
- `POST /api/platform/gyms`
- `GET /api/platform/gyms/[id]`
- `PATCH /api/platform/gyms/[id]`
- `POST /api/platform/gyms/[id]/suspend`
- `POST /api/platform/gyms/[id]/reactivate`
- `POST /api/platform/gyms/[id]/impersonate`

### 7.3 Subscriptions
- `GET /api/platform/subscriptions`
- `POST /api/platform/subscriptions`
- `PATCH /api/platform/subscriptions/[id]`

### 7.4 Billing
- `GET /api/platform/payments`
- `POST /api/platform/payments/[id]/refund`

### 7.5 Support
- `GET /api/platform/tickets`
- `POST /api/platform/tickets/[id]/reply`
- `PATCH /api/platform/tickets/[id]`

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Claude Code | Initial draft |
