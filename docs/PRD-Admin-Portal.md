# Product Requirements Document: Admin Portal

## Document Information

- **Product:** FitStudio Gym Management - Admin Portal
- **Version:** 1.0 (Phase 1)
- **Last Updated:** January 30, 2026
- **Status:** Active Development
- **Author:** FitStudio Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Core Features](#core-features)
5. [Feature Specifications](#feature-specifications)
6. [User Workflows](#user-workflows)
7. [Technical Requirements](#technical-requirements)
8. [Future Enhancements](#future-enhancements)

---

## Executive Summary

The FitStudio Admin Portal is a comprehensive web-based management system designed for gym administrators to efficiently manage their fitness facility operations. It provides tools for member management, subscription handling, class scheduling, payment tracking, and business analytics.

### Key Objectives

- Streamline gym operations through centralized management
- Reduce administrative overhead by 60%
- Improve member experience through better service delivery
- Provide real-time business insights and analytics
- Enable data-driven decision making

### Target Users

- **Primary:** Gym Owners, General Managers
- **Secondary:** Front Desk Staff, Membership Coordinators
- **Tertiary:** Trainers (view-only access for assigned classes)

---

## Product Overview

### What is the Admin Portal?

The Admin Portal is the command center for gym operations, providing a unified interface to:

- Manage member information and memberships
- Create and configure subscription plans
- Track payments and revenue
- Monitor class bookings and attendance
- Analyze business metrics and trends
- Configure gym settings and branding

### Access and Authentication

**URL Structure:**
- Development: `http://localhost:3000/admin`
- Production: `https://fitstudio.ng/admin` or `https://fitstudio.gymflowpro.com/admin`

**Authentication:**
- Email and password-based login
- Session-based authentication (Auth.js v5)
- Automatic session timeout after 30 days of inactivity
- Multi-tenant isolation (users can only access their gym's data)

**Default Credentials (Development):**
- Email: `admin@fitstudio.ng`
- Password: `admin123`
- Role: `ADMIN`

---

## User Roles and Permissions

### Role Hierarchy

```
SUPER_ADMIN (Platform Level)
    |
    └─── ADMIN (Gym Level)
            |
            ├─── TRAINER (Gym Level)
            |
            └─── MEMBER (Gym Level)
```

### SUPER_ADMIN (Future Phase)

**Capabilities:**
- Manage all gyms on the platform
- Create new gym tenants
- View platform-wide analytics
- Configure platform settings
- Manage subscription billing

**Access:**
- `admin.gymflowpro.com` (Platform admin portal)

### ADMIN (Current Implementation)

**Capabilities:**
- Full access to their gym's data
- Manage members (create, read, update, delete)
- Manage membership plans
- Assign and modify memberships
- View all payments and bookings
- Configure gym settings and branding
- Manage trainers and classes
- View comprehensive analytics

**Access:**
- `/admin` portal routes
- All admin-level API endpoints

**Restrictions:**
- Cannot access other gyms' data
- Cannot modify platform-level settings
- Cannot create new gym tenants

### TRAINER (Future Phase)

**Capabilities:**
- View assigned classes and schedules
- Mark attendance for classes
- View member profiles (limited)
- Update class notes and feedback

**Restrictions:**
- Cannot modify member data
- Cannot access financial information
- Cannot create or delete classes

### MEMBER (Future Phase)

**Capabilities:**
- View own profile and membership
- Book classes
- View payment history
- Update personal information

**Access:**
- `/member` portal routes only

---

## Core Features

### 1. Dashboard and Analytics

**Purpose:** Provide at-a-glance insights into gym performance and operations.

**Key Metrics:**
- Total active members
- Monthly revenue (current month)
- New members this month
- Today's class bookings
- Active memberships by plan
- Recent payment transactions
- Expiring memberships alerts

**Visual Components:**
- Metric cards with trend indicators
- Membership breakdown chart (by plan)
- Recent payments table
- Expiring memberships list
- Quick action buttons

**Real-time Updates:**
- Metrics refresh on page load
- Data fetched via server actions
- Optimistic UI updates for smooth UX

### 2. Member Management

**Purpose:** Complete lifecycle management of gym members from onboarding to offboarding.

#### 2.1 Member List View

**Display:**
- Grid/table view with pagination (20 members per page)
- Member card showing:
  - Profile photo (avatar or initials)
  - Full name
  - Email address
  - Phone number
  - Current membership status
  - Active plan name (if any)
  - Join date

**Features:**
- Search by name or email (real-time filtering)
- Filter by status: Active, Inactive, Suspended
- Sort by: Name, Join Date, Membership Status
- Pagination controls
- Quick actions: View, Edit, Delete

**Actions:**
- "Add Member" button (top right)
- Click member card to view full profile
- Hover actions for quick edit/delete

#### 2.2 Add New Member

**Form Fields:**

**Personal Information (Required):**
- First Name (2-50 characters)
- Last Name (2-50 characters)
- Email (unique per gym, validated format)
- Password (min 8 characters, auto-generated option)
- Phone Number (validated format)
- Date of Birth (date picker, age validation)
- Gender (dropdown: Male, Female, Other, Prefer not to say)

**Address Information (Optional):**
- Full Address (street, city, state)

**Emergency Contact (Required):**
- Emergency Contact Name
- Emergency Contact Phone

**Account Settings:**
- Status (Active, Inactive, Suspended)
- Role (Member, Trainer, Admin)

**Membership Assignment (Optional):**
- Select membership plan from dropdown
- Set start date (defaults to today)
- Auto-calculated end date based on plan duration

**Validation:**
- Email format and uniqueness check
- Phone number format validation
- Age verification (minimum 16 years)
- Password strength requirements
- Emergency contact required for safety

**Post-Creation:**
- Success toast notification
- Auto-redirect to member profile
- Welcome email sent (Phase 2)
- Member credentials displayed

#### 2.3 Member Profile View

**Information Sections:**

**Profile Header:**
- Large avatar (initials or photo)
- Member name and ID
- Status badge (Active/Inactive/Suspended)
- Join date
- Quick action buttons: Edit, Delete, Assign Plan

**Personal Details:**
- Email and phone (clickable)
- Date of birth and age
- Gender
- Full address
- Emergency contact information

**Membership Information:**
- Current plan name and price
- Billing cycle (Monthly/Quarterly/Yearly)
- Start date and end date
- Days remaining
- Status indicator
- Auto-renew status
- Action buttons: Change Plan, Cancel, Renew

**Payment History:**
- Table of all payments
- Columns: Date, Amount, Plan, Status, Method
- Pagination (10 per page)
- Filter by status and date range
- Download receipt (Phase 2)

**Booking History:**
- Table of class bookings
- Columns: Date, Class, Trainer, Status
- Pagination (10 per page)
- Filter by status and date
- View booking details

**Activity Log (Future):**
- Check-ins and check-outs
- Class attendance
- Plan changes
- Payment updates

**Actions Available:**
- Edit member details
- Delete member (with confirmation)
- Assign new membership plan
- Change existing membership
- Cancel membership
- Suspend/reactivate account
- Send message (Phase 2)
- View attendance report

#### 2.4 Edit Member

**Editable Fields:**
- All personal information
- Address and emergency contact
- Status and role
- Profile photo (Phase 2)

**Non-Editable:**
- Email (requires re-verification)
- Join date
- Member ID

**Validation:**
- Same as add member form
- Conflict detection for email changes

**Save Behavior:**
- Optimistic updates
- Success/error toast notifications
- Auto-redirect to profile on success

#### 2.5 Delete Member

**Confirmation Required:**
- Warning dialog explaining consequences
- Cannot be undone
- Associated data handling explained

**Restrictions:**
- Cannot delete if active membership exists (must cancel first)
- Cannot delete if pending payments exist

**Data Handling:**
- Member record marked as deleted (soft delete)
- Historical data retained for reports
- Personal data anonymized after 90 days (GDPR)

### 3. Membership Plans Management

**Purpose:** Create and manage subscription plans that members can purchase.

#### 3.1 Plans List View

**Display:**
- Card grid layout (3 columns on desktop)
- Plan card showing:
  - Plan name and description
  - Price with currency symbol
  - Billing cycle indicator
  - Duration (e.g., "1 month", "3 months")
  - Number of active subscribers
  - Featured badge (if applicable)
  - Status badge (Active/Inactive)
  - Feature list (up to 5 features shown)

**Visual Indicators:**
- Featured plan highlighted with special border/color
- Inactive plans shown with muted colors
- Subscriber count badge

**Actions:**
- "Create Plan" button (top right)
- Edit button on each card
- Delete button (disabled if plan has subscribers)
- Toggle active/inactive status

#### 3.2 Create New Plan

**Form Sections:**

**Basic Information:**
- Plan Name (required, unique per gym)
  - Examples: "Basic", "Premium", "VIP", "Student"
  - 2-100 characters
- Description (optional)
  - Brief explanation of what's included
  - 0-500 characters
  - Displayed on marketing pages

**Pricing:**
- Currency (required)
  - Dropdown: NGN, USD, GBP, EUR
  - Defaults to NGN
- Price (required)
  - Decimal number (up to 10 digits, 2 decimal places)
  - Displayed with currency symbol
  - Examples: 25000, 45000, 75000

**Billing Configuration:**
- Billing Cycle (required)
  - Monthly: Charged every month
  - Quarterly: Charged every 3 months
  - Yearly: Charged every 12 months
- Duration Value (required)
  - Numeric value (e.g., 1, 3, 6, 12)
  - Must be positive integer
- Duration Type (required)
  - Days: Short-term access (e.g., day passes)
  - Months: Standard memberships
  - Years: Long-term commitments

**Example Configurations:**
- Monthly Basic: Billing Cycle = Monthly, Duration = 1 Month
- Quarterly Premium: Billing Cycle = Quarterly, Duration = 3 Months
- Annual VIP: Billing Cycle = Yearly, Duration = 12 Months
- 10-Day Trial: Billing Cycle = Monthly, Duration = 10 Days

**Access Control:**
- Class Credits (optional)
  - Number of classes member can book per billing cycle
  - Leave empty for unlimited
  - Examples: 8 classes/month, 20 classes/month, unlimited

**Features List:**
- Add unlimited features
- Each feature is a single line of text
- Displayed as checkmark list to members
- Examples:
  - "Access to gym floor"
  - "All group classes included"
  - "Personal training sessions (2/month)"
  - "Locker room access"
  - "Nutritional consultation"
  - "Mobile app access"
  - "Guest passes (2/month)"

**Settings:**
- Featured Plan (toggle)
  - Only one plan should be featured
  - Highlighted on pricing page
  - Recommended to members
- Active Status (toggle)
  - Active: Available for purchase
  - Inactive: Hidden from members, existing subscriptions continue

**Validation:**
- Plan name must be unique within gym
- Price must be positive number
- Duration value must be positive integer
- Billing cycle and duration must be logical
  - Warning if billing cycle > duration

**Post-Creation:**
- Success notification
- Redirect to plans list
- Plan immediately available for assignment

#### 3.3 Edit Plan

**Editable Fields:**
- All plan information
- Features list (add/remove)
- Settings and status

**Restrictions:**
- Cannot change plan if it would invalidate existing memberships
- Price changes only affect new subscriptions
- Duration changes require careful consideration

**Warning Dialogs:**
- If plan has active subscribers, show impact warning
- Suggest creating new plan instead for major changes

#### 3.4 Delete Plan

**Restrictions:**
- Cannot delete if plan has active subscribers
- Must reassign all members first
- Historical data retained for reporting

**Confirmation:**
- Explicit warning about consequences
- Require typing plan name to confirm

#### 3.5 Toggle Plan Status

**Active → Inactive:**
- Plan hidden from member portal
- Existing subscriptions continue
- No new subscriptions allowed
- Can be reactivated

**Inactive → Active:**
- Plan becomes available for purchase
- Shown in member portal and pricing page

### 4. Membership Assignment

**Purpose:** Link members to subscription plans and manage their access.

#### 4.1 Assign New Membership

**Trigger Points:**
- From member profile page
- During new member creation
- From plans page (select plan first)

**Form Fields:**
- Member Selection (if not pre-selected)
  - Searchable dropdown
  - Shows only members without active memberships
- Plan Selection (required)
  - Dropdown of active plans
  - Shows plan price and duration
- Start Date (optional)
  - Date picker
  - Defaults to today
  - Can be future-dated
- Payment Status (required)
  - Pending: Awaiting payment
  - Completed: Payment received
  - Failed: Payment attempt failed
- Payment Method (optional)
  - Cash
  - Bank Transfer
  - Card
  - Paystack (Phase 2)
- Notes (optional)
  - Internal notes about the membership
  - Not visible to member

**Auto-Calculations:**
- End date calculated from: start date + plan duration
- Prorated amount if mid-cycle start (Phase 2)
- Next billing date based on billing cycle

**Validation:**
- Member cannot have multiple active memberships
- Start date cannot be in the past (warning, not block)
- Plan must be active

**Post-Assignment:**
- Success notification
- Member notified via email (Phase 2)
- Dashboard metrics updated
- Member's profile updated
- Payment record created

#### 4.2 Change Membership Plan

**Scenarios:**
- Upgrade: Move to higher-tier plan
- Downgrade: Move to lower-tier plan
- Switch: Change to different plan at same tier

**Process:**
- Select new plan
- Choose effective date:
  - Immediately: Current plan cancelled, new plan starts now
  - End of current period: New plan starts when current expires
- Handle prorating (Phase 2):
  - Calculate unused portion of current plan
  - Apply credit to new plan
  - Generate adjustment payment

**Impact Display:**
- Show current plan vs new plan comparison
- Price difference
- Duration change
- Feature differences
- Next billing date and amount

**Confirmation Required:**
- Explicit approval from admin
- Member notification (Phase 2)

#### 4.3 Cancel Membership

**Reasons for Cancellation:**
- Member request
- Non-payment
- Policy violation
- Gym closure

**Cancellation Types:**
- Immediate: Access revoked now
- End of period: Access until current period ends

**Process:**
- Confirm cancellation reason
- Select cancellation type
- Process any refunds (manual for now, automated Phase 2)
- Update member status
- Send confirmation (Phase 2)

**Post-Cancellation:**
- Member marked as inactive
- Access to gym features revoked
- Historical data retained
- Reactivation possible (creates new membership)

#### 4.4 Suspend Membership

**Use Cases:**
- Temporary medical issues
- Extended travel
- Financial hardship
- Pregnancy/maternity

**Suspension Settings:**
- Suspension duration (e.g., 1-3 months)
- Resume date
- Extend end date by suspension period (optional)
- Billing pause or continue

**Member Communication:**
- Suspension confirmation email
- Resume date reminder (7 days before)

**Reactivation:**
- Automatic on resume date
- Manual reactivation by admin
- Member portal reactivation (Phase 3)

### 5. Payment Tracking

**Purpose:** Monitor all financial transactions and revenue.

#### 5.1 Payment Records

**Information Captured:**
- Payment ID (auto-generated)
- Member name and ID
- Membership plan
- Amount paid
- Currency
- Payment date and time
- Payment method (Cash, Card, Bank Transfer, Paystack)
- Status (Pending, Completed, Failed, Refunded)
- Transaction reference (for online payments)
- Notes (optional)

**Payment Status Flow:**
```
Pending → Completed (successful payment)
Pending → Failed (payment declined)
Completed → Refunded (refund processed)
```

#### 5.2 Payment Dashboard

**Metrics:**
- Total revenue (all time)
- Monthly revenue (current month)
- Average transaction value
- Payment method breakdown
- Failed payment rate

**Filters:**
- Date range (today, this week, this month, custom)
- Status (all, completed, pending, failed)
- Payment method
- Member search

**Export:**
- CSV export for accounting (Phase 2)
- PDF reports (Phase 2)
- Integration with accounting software (Future)

#### 5.3 Manual Payment Recording

**When Used:**
- Cash payments at desk
- Bank transfers
- External payment processors
- Offline payments

**Process:**
- Select member and membership
- Enter amount and date
- Choose payment method
- Add reference/notes
- Mark as completed
- Generate receipt (Phase 2)

#### 5.4 Refund Processing

**Refund Scenarios:**
- Membership cancellation
- Service not delivered
- Billing errors
- Member dissatisfaction

**Process:**
- Navigate to original payment
- Click "Refund" button
- Enter refund amount (partial or full)
- Add reason for refund
- Confirm refund
- Update payment status
- Process actual refund (manual for now)

**Tracking:**
- Original payment linked to refund
- Refund shows in payment history
- Member balance updated
- Accounting records updated

### 6. Class and Schedule Management (Phase 2/3)

**Purpose:** Organize group fitness classes and manage schedules.

#### 6.1 Class Types

**Information:**
- Class name (e.g., HIIT, Yoga, Spin, Boxing)
- Category (Cardio, Strength, Flexibility, etc.)
- Description
- Duration (minutes)
- Maximum capacity
- Equipment required
- Difficulty level (Beginner, Intermediate, Advanced)
- Active status

**Management:**
- Create new class types
- Edit existing classes
- Activate/deactivate classes
- View popularity metrics

#### 6.2 Class Scheduling

**Schedule Creation:**
- Select class type
- Assign trainer
- Choose date and time
- Set duration
- Define capacity
- Set location/room
- Mark as recurring (optional)

**Recurring Schedules:**
- Daily
- Weekly (select days)
- Custom pattern

**Conflict Detection:**
- Trainer double-booking
- Room conflicts
- Member booking limits

#### 6.3 Booking Management

**Admin Capabilities:**
- View all bookings
- Book classes for members
- Cancel bookings
- Manage waitlists
- Mark attendance
- View no-show rates

**Booking Information:**
- Member details
- Class details
- Booking date/time
- Status (Confirmed, Cancelled, Completed, No-show)
- Check-in time (when attended)

### 7. Trainer Management

**Purpose:** Manage gym staff who conduct classes and train members.

#### 7.1 Trainer Profiles

**Information:**
- Personal details (name, photo, bio)
- Specializations (Yoga, HIIT, Personal Training)
- Certifications
- Years of experience
- Contact information
- Employment status (Active, Inactive)
- Hourly rate (for payroll)

**Created During Seeding:**
- 4 sample trainers with specializations
- Bio and certifications included
- Active status

#### 7.2 Trainer Assignment

**Features:**
- Assign trainers to classes
- View trainer schedule
- Track trainer workload
- Manage trainer availability
- Set class instructor preferences

#### 7.3 Trainer Performance (Future)

**Metrics:**
- Classes conducted
- Average attendance
- Member ratings
- Revenue generated
- Retention rates

### 8. Reports and Analytics (Phase 2)

**Purpose:** Data-driven insights for business decisions.

#### 8.1 Membership Reports

**Available Reports:**
- New member acquisition trends
- Membership retention rates
- Churn analysis
- Plan popularity
- Upgrade/downgrade patterns
- Geographic distribution

**Visualizations:**
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions

#### 8.2 Revenue Reports

**Financial Analytics:**
- Revenue by plan
- Revenue by payment method
- Monthly recurring revenue (MRR)
- Annual recurring revenue (ARR)
- Average revenue per user (ARPU)
- Lifetime value (LTV)

**Export Options:**
- PDF reports
- Excel/CSV export
- Email scheduled reports

#### 8.3 Operational Reports

**Metrics:**
- Class attendance rates
- Peak usage times
- Equipment utilization
- Staff efficiency
- Member engagement scores

### 9. Gym Settings and Configuration

**Purpose:** Customize gym branding and operational settings.

#### 9.1 Business Information

**Settings:**
- Gym name
- Logo and favicon
- Brand colors (primary, secondary)
- Contact information
- Address and location
- Business hours
- Social media links

#### 9.2 Website Configuration

**Customization:**
- Hero section content
- About us section
- Features highlights
- Custom pages
- SEO settings (meta tags)
- Custom domain setup (Future)

#### 9.3 Email Templates (Phase 2)

**Automated Emails:**
- Welcome email (new members)
- Membership renewal reminders
- Payment receipts
- Class booking confirmations
- Cancellation confirmations

**Template Editor:**
- HTML email templates
- Variable substitution
- Preview before sending
- Test email functionality

#### 9.4 Operational Settings

**Configuration:**
- Membership grace period (days after expiration)
- Auto-renewal default setting
- Booking cancellation policy (hours before class)
- Maximum advance booking days
- Waitlist enabled/disabled
- Payment reminder schedule

### 10. User Management

**Purpose:** Manage admin and staff accounts.

#### 10.1 Admin Users

**Capabilities:**
- Create new admin users
- Assign roles (Admin, Staff, Trainer)
- Set permissions granularly
- Deactivate users
- Reset passwords

**Permission Levels:**
- Full Admin: All capabilities
- Membership Manager: Member and plan management only
- Front Desk: Bookings and check-ins only
- Trainer: Class management and attendance only
- Read-Only: View access only

#### 10.2 Activity Logging (Phase 2)

**Audit Trail:**
- Track all admin actions
- Record data changes
- Log login/logout events
- Monitor permission changes
- Export audit logs

**Information Logged:**
- User who performed action
- Action type
- Timestamp
- Before/after values
- IP address

### 11. Notifications and Alerts

**Purpose:** Keep admins informed of important events.

#### 11.1 System Notifications

**Alert Types:**
- New member signups
- Membership expirations (7 days, 1 day)
- Failed payments
- Class cancellations
- High booking classes (near capacity)
- Low attendance alerts

**Delivery Methods:**
- In-app notifications (bell icon)
- Email notifications
- SMS notifications (Phase 2)
- Push notifications (Phase 3)

#### 11.2 Notification Settings

**Configuration:**
- Enable/disable notification types
- Set notification thresholds
- Choose delivery methods
- Set quiet hours
- Notification preferences per admin user

---

## User Workflows

### Workflow 1: Onboard New Member

```
Step 1: Admin logs into admin portal
Step 2: Navigate to Members → Add Member
Step 3: Fill member information form:
        - Personal details (name, email, phone, DOB, gender)
        - Address information
        - Emergency contact
Step 4: Optionally assign membership plan:
        - Select plan from dropdown
        - Set start date
        - Confirm payment status
Step 5: Click "Create Member"
Step 6: System validates and creates member
Step 7: Success notification displayed
Step 8: Redirect to member profile
Step 9: Member receives welcome email (Phase 2)
```

### Workflow 2: Create Membership Plan

```
Step 1: Navigate to Plans → Create Plan
Step 2: Enter basic information:
        - Plan name (e.g., "Premium")
        - Description
Step 3: Configure pricing:
        - Select currency (NGN)
        - Enter price (45000)
Step 4: Set billing configuration:
        - Billing cycle (Monthly)
        - Duration value (1)
        - Duration type (Months)
Step 5: Add class credits (optional):
        - Enter number (e.g., 12 classes/month)
Step 6: Add features:
        - Type feature and click Add
        - Repeat for all features
Step 7: Configure settings:
        - Toggle Featured (if recommended plan)
        - Set Active status
Step 8: Click "Create Plan"
Step 9: Success notification
Step 10: Redirect to plans list
```

### Workflow 3: Assign Membership to Existing Member

```
Step 1: Navigate to Members list
Step 2: Search for member by name or email
Step 3: Click on member card to view profile
Step 4: Click "Assign Plan" button
Step 5: Select membership plan from dropdown
Step 6: Choose start date (defaults to today)
Step 7: Confirm payment details:
        - Payment status (Completed/Pending)
        - Payment method
Step 8: Add notes if needed
Step 9: Click "Assign Membership"
Step 10: System calculates end date
Step 11: Membership activated
Step 12: Dashboard metrics updated
Step 13: Member notified (Phase 2)
```

### Workflow 4: Handle Membership Cancellation

```
Step 1: Navigate to member profile
Step 2: Locate active membership section
Step 3: Click "Cancel Membership" button
Step 4: Select cancellation type:
        - Immediate (ends now)
        - End of period (ends on expiry date)
Step 5: Enter cancellation reason
Step 6: Confirm cancellation in dialog
Step 7: Process any refunds if applicable
Step 8: System updates member status
Step 9: Access revoked (immediate) or scheduled
Step 10: Member notified of cancellation
```

### Workflow 5: Process Manual Payment

```
Step 1: Navigate to Payments (or member profile)
Step 2: Click "Record Payment"
Step 3: Select member (if not pre-selected)
Step 4: Select membership/service
Step 5: Enter payment details:
        - Amount received
        - Payment method (Cash/Card/Transfer)
        - Payment date
        - Transaction reference (if applicable)
Step 6: Add notes if needed
Step 7: Click "Record Payment"
Step 8: System creates payment record
Step 9: Member's account credited
Step 10: Receipt generated (Phase 2)
Step 11: Success notification
```

### Workflow 6: Monitor Dashboard and Analytics

```
Step 1: Admin logs in to portal
Step 2: Dashboard loads with real-time metrics:
        - Total members
        - Monthly revenue
        - New members this month
        - Today's bookings
Step 3: Review membership breakdown chart
Step 4: Check expiring memberships alert
Step 5: Review recent payment transactions
Step 6: Identify trends and patterns
Step 7: Click through to detailed views as needed
Step 8: Export reports if required (Phase 2)
```

---

## Technical Requirements

### Performance

- **Page Load Time:** < 2 seconds on 3G connection
- **Time to Interactive:** < 3 seconds
- **API Response Time:** < 500ms for queries, < 1s for mutations
- **Concurrent Users:** Support 50+ simultaneous admin sessions
- **Database Queries:** Optimized with indexes, < 100ms query time

### Security

- **Authentication:** Session-based with HTTP-only cookies
- **Authorization:** Role-based access control (RBAC)
- **Data Isolation:** Multi-tenant with gymId filtering on all queries
- **Password Security:** bcrypt hashing with 10 rounds
- **Session Management:** 30-day expiration, secure flags enabled
- **CSRF Protection:** Built-in with Auth.js
- **XSS Prevention:** Input sanitization and output encoding
- **SQL Injection Prevention:** Parameterized queries via Prisma

### Browser Support

- **Chrome:** Latest 2 versions
- **Firefox:** Latest 2 versions
- **Safari:** Latest 2 versions
- **Edge:** Latest 2 versions
- **Mobile Safari:** iOS 14+
- **Chrome Mobile:** Latest version

### Accessibility

- **WCAG Level:** AA compliance
- **Keyboard Navigation:** Full support
- **Screen Readers:** Tested with NVDA, JAWS, VoiceOver
- **Color Contrast:** Minimum 4.5:1 ratio
- **Focus Indicators:** Visible on all interactive elements
- **ARIA Labels:** Proper labeling for all components

### Data Management

- **Backup Frequency:** Daily automated backups
- **Retention Period:** 90 days for active data, 7 years for financial
- **Data Export:** CSV, PDF export capabilities
- **Data Privacy:** GDPR compliance (where applicable)
- **Soft Delete:** Records marked deleted, not permanently removed

---

## Future Enhancements

### Phase 2: Payment Integration (Next)

**Features:**
- Paystack payment gateway integration
- Automated subscription billing
- Payment link generation
- Webhook handling for payment events
- Automated invoice generation
- Refund automation
- Payment plan options (installments)

**Timeline:** 4-6 weeks

### Phase 3: Advanced Features

**Member Portal:**
- Self-service member accounts
- Online class booking
- Profile management
- Payment history viewing
- Digital membership cards

**Class Management:**
- Recurring class schedules
- Waitlist management
- Attendance tracking
- Class ratings and reviews
- Virtual class support (Zoom integration)

**Timeline:** 8-10 weeks

### Phase 4: Business Intelligence

**Advanced Analytics:**
- Predictive analytics for churn
- Revenue forecasting
- Member lifetime value prediction
- Automated business insights
- Custom report builder
- Data visualization dashboard

**Timeline:** 6-8 weeks

### Phase 5: Mobile Applications

**iOS and Android Apps:**
- Native mobile apps for members
- Admin mobile app for on-the-go management
- Push notifications
- Offline mode support
- Mobile check-in via QR codes

**Timeline:** 12-16 weeks

### Phase 6: Hardware Integration

**Access Control:**
- Integration with gym access devices
- Automated check-in/check-out
- Real-time occupancy tracking
- Equipment usage monitoring
- Locker management system

**Timeline:** 8-12 weeks

### Phase 7: Marketing and Growth

**Features:**
- Email marketing campaigns
- SMS campaigns
- Referral program management
- Lead tracking and conversion
- Social media integration
- Website visitor analytics

**Timeline:** 6-8 weeks

---

## Success Metrics

### Key Performance Indicators (KPIs)

**Operational Efficiency:**
- Time to onboard new member: < 5 minutes
- Time to create membership plan: < 3 minutes
- Admin task completion rate: > 95%
- Error rate in data entry: < 2%

**Business Impact:**
- Member retention improvement: +15%
- Administrative time reduction: -60%
- Revenue tracking accuracy: 100%
- Member satisfaction: > 4.5/5

**Technical Performance:**
- System uptime: 99.9%
- Page load speed: < 2s
- API response time: < 500ms
- Zero data breaches

### User Satisfaction

**Admin Feedback:**
- Ease of use: Target 4.5/5
- Feature completeness: Target 4/5
- Performance satisfaction: Target 4.5/5
- Support responsiveness: Target 4.5/5

**Member Impact:**
- Faster check-in process
- Accurate billing
- Better class availability
- Improved communication

---

## Glossary

**Terms and Definitions:**

- **Member:** Individual who has signed up for gym services
- **Membership:** Active subscription to a membership plan
- **Membership Plan:** Subscription offering with defined price, duration, and features
- **Billing Cycle:** Frequency of recurring charges (Monthly, Quarterly, Yearly)
- **Duration:** Length of access provided by membership plan
- **Class Credits:** Number of classes member can book per billing cycle
- **Featured Plan:** Highlighted plan recommended to prospective members
- **Multi-tenant:** System architecture supporting multiple gyms with data isolation
- **gymId:** Unique identifier for each gym tenant in the system
- **Soft Delete:** Marking records as deleted without permanent removal
- **RBAC:** Role-Based Access Control for permission management
- **MRR:** Monthly Recurring Revenue
- **ARR:** Annual Recurring Revenue
- **ARPU:** Average Revenue Per User
- **LTV:** Lifetime Value of a customer
- **Churn:** Rate at which members cancel their memberships

---

## Appendix

### A. Sample Data Structure

**Member Record:**
```json
{
  "id": "cm1a2b3c4d5e6f7g8h9i0",
  "gymId": "gym_fitstudio_001",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234 800 000 0000",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "address": "123 Main St, Lagos, Nigeria",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+234 800 000 0001",
  "role": "MEMBER",
  "status": "ACTIVE",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-20T14:20:00Z"
}
```

**Membership Plan Record:**
```json
{
  "id": "plan_premium_001",
  "gymId": "gym_fitstudio_001",
  "name": "Premium",
  "description": "Our most popular choice for serious fitness enthusiasts",
  "price": 45000,
  "currency": "NGN",
  "billingCycle": "MONTHLY",
  "durationValue": 1,
  "durationType": "MONTHS",
  "classCredits": 12,
  "features": [
    "Unlimited gym access",
    "12 group classes per month",
    "Personal training session (1/month)",
    "Nutritional consultation",
    "Locker room access",
    "Mobile app access"
  ],
  "isFeatured": true,
  "isActive": true,
  "sortOrder": 2
}
```

**Membership Record:**
```json
{
  "id": "membership_001",
  "gymId": "gym_fitstudio_001",
  "userId": "cm1a2b3c4d5e6f7g8h9i0",
  "planId": "plan_premium_001",
  "status": "ACTIVE",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-02-01T00:00:00Z",
  "autoRenew": true
}
```

### B. API Endpoints Reference

**Authentication:**
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

**Members:**
- `GET /api/members` - List members (via server action)
- `POST /api/members` - Create member (via server action)
- `GET /api/members/:id` - Get member details (via server action)
- `PUT /api/members/:id` - Update member (via server action)
- `DELETE /api/members/:id` - Delete member (via server action)

**Plans:**
- `GET /api/plans` - List plans (via server action)
- `POST /api/plans` - Create plan (via server action)
- `PUT /api/plans/:id` - Update plan (via server action)
- `DELETE /api/plans/:id` - Delete plan (via server action)

**Memberships:**
- `POST /api/memberships` - Assign membership (via server action)
- `PUT /api/memberships/:id` - Update membership (via server action)
- `DELETE /api/memberships/:id` - Cancel membership (via server action)

### C. Database Schema Diagram

```
┌──────────────┐
│     Gym      │
├──────────────┤
│ id (PK)      │
│ name         │
│ slug         │
│ customDomain │
│ ...          │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼───────┐       ┌─────────────────┐
│    User      │───────┤   Membership    │
├──────────────┤  1:1  ├─────────────────┤
│ id (PK)      │       │ id (PK)         │
│ gymId (FK)   │       │ gymId (FK)      │
│ email        │       │ userId (FK)     │
│ firstName    │       │ planId (FK)     │
│ lastName     │       │ status          │
│ role         │       │ startDate       │
│ status       │       │ endDate         │
│ ...          │       │ autoRenew       │
└──────────────┘       └────────┬────────┘
                                │
                                │ N:1
                                │
                       ┌────────▼──────────┐
                       │ MembershipPlan    │
                       ├───────────────────┤
                       │ id (PK)           │
                       │ gymId (FK)        │
                       │ name              │
                       │ price             │
                       │ billingCycle      │
                       │ durationValue     │
                       │ durationType      │
                       │ features          │
                       │ ...               │
                       └───────────────────┘
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-30 | Development Team | Initial PRD creation |

---

**Document Status:** ACTIVE
**Next Review Date:** 2026-02-15
**Owner:** Product Management
**Stakeholders:** Development, Operations, Business
