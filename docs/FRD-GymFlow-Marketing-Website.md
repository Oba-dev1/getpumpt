# Functional Requirements Document (FRD)
# Pumpt - Marketing Website

**Version:** 1.0
**Date:** January 2026
**Status:** Draft

---

## 1. Executive Summary

The Pumpt Marketing Website is the public-facing SaaS landing page designed to convert gym owners into paying customers. This website showcases the platform's features, pricing, and value proposition, enabling potential customers to sign up for trials or subscriptions.

**Primary URL:** `www.getpumpt.com` / `getpumpt.com`

**Target Audience:**
- Gym owners looking for management software
- Fitness studio managers
- Personal training business owners
- Fitness entrepreneurs starting new gyms

**Related Documents:**
- [FRD-Platform-Admin-Portal.md](./FRD-Platform-Admin-Portal.md) - Platform management (your dashboard)
- [FRD-Gym-Admin-Portal.md](./FRD-Gym-Admin-Portal.md) - Gym owner dashboard
- [FRD-Member-Portal.md](./FRD-Member-Portal.md) - Gym member self-service

---

## 2. Site Architecture

### 2.1 Sitemap

```
getpumpt.com/
├── / (Home)
├── /features
│   ├── /features/member-management
│   ├── /features/class-scheduling
│   ├── /features/payments
│   ├── /features/website-builder
│   └── /features/analytics
├── /pricing
├── /about
├── /contact
├── /blog (optional - Phase 2)
│   └── /blog/[slug]
├── /demo
├── /login
├── /signup
│   └── /signup/[plan]
├── /forgot-password
├── /terms
├── /privacy
└── /help (optional - links to help center)
```

### 2.2 Navigation Structure

**Primary Navigation (Header)**
| Item | Link | Type |
|------|------|------|
| Features | /features | Dropdown |
| Pricing | /pricing | Link |
| About | /about | Link |
| Contact | /contact | Link |
| Login | /login | Button (secondary) |
| Start Free Trial | /signup | Button (primary) |

**Footer Navigation**
| Column | Links |
|--------|-------|
| Product | Features, Pricing, Demo, Integrations |
| Company | About, Blog, Careers, Contact |
| Resources | Help Center, Documentation, API |
| Legal | Terms of Service, Privacy Policy |

---

## 3. Page Specifications

### 3.1 Home Page

**Route:** `/`

**Purpose:** Primary landing page to capture attention, communicate value, and drive conversions.

#### 3.1.1 Sections

##### Hero Section
| Element | Description | Priority |
|---------|-------------|----------|
| Headline | Primary value proposition (max 10 words) | High |
| Subheadline | Supporting text explaining benefits (max 25 words) | High |
| Primary CTA | "Start Free Trial" → /signup | High |
| Secondary CTA | "Watch Demo" → /demo or modal video | High |
| Hero Image/Video | Dashboard preview or gym imagery | High |
| Trust Indicators | "No credit card required" / "14-day free trial" | High |

**Suggested Copy:**
- Headline: "The Complete Gym Management Platform"
- Subheadline: "Manage members, schedule classes, process payments, and grow your fitness business — all in one place."

##### Logo Cloud / Social Proof
| Element | Description | Priority |
|---------|-------------|----------|
| Client Logos | 4-6 gym logos using the platform | Medium |
| Stats | "500+ gyms" / "50,000+ members managed" | Medium |

##### Features Overview
| Element | Description | Priority |
|---------|-------------|----------|
| Section Title | "Everything you need to run your gym" | High |
| Feature Cards | 4-6 key features with icons | High |
| Link | "See all features" → /features | Medium |

**Feature Cards:**
1. **Member Management** - Track members, memberships, and attendance
2. **Class Scheduling** - Create schedules, manage bookings, reduce no-shows
3. **Payment Processing** - Collect payments, automate billing, track revenue
4. **Custom Website** - Beautiful, branded website for your gym
5. **Mobile Access** - Members book and pay from their phones
6. **Reports & Analytics** - Insights to grow your business

##### How It Works
| Element | Description | Priority |
|---------|-------------|----------|
| Section Title | "Get started in minutes" | High |
| Step 1 | Sign up and customize your gym profile | High |
| Step 2 | Add your classes, plans, and team | High |
| Step 3 | Invite members and start managing | High |
| Visual | Timeline or numbered steps with illustrations | High |

##### Benefits / Why Pumpt
| Element | Description | Priority |
|---------|-------------|----------|
| Section Title | "Why gym owners love Pumpt" | High |
| Benefit 1 | Save 10+ hours per week on admin | High |
| Benefit 2 | Increase member retention by 25% | High |
| Benefit 3 | Boost revenue with automated billing | High |
| Each benefit | Icon + headline + 2-line description | High |

##### Testimonials
| Element | Description | Priority |
|---------|-------------|----------|
| Section Title | "Trusted by fitness businesses" | High |
| Testimonial Cards | 3 testimonials with photo, name, gym, quote | High |
| Star Rating | 5-star display | Medium |
| Carousel | On mobile, swipeable | Medium |

**Testimonial Structure:**
- Quote (2-3 sentences)
- Author Name
- Title/Role
- Gym Name
- Author Photo
- Star Rating (optional)

##### Pricing Preview
| Element | Description | Priority |
|---------|-------------|----------|
| Section Title | "Simple, transparent pricing" | High |
| Plan Cards | 3 tiers (Starter, Professional, Enterprise) | High |
| Price | Monthly price displayed | High |
| Key Features | 3-4 bullet points per plan | High |
| CTA | "View full pricing" → /pricing | High |

##### Final CTA Section
| Element | Description | Priority |
|---------|-------------|----------|
| Headline | "Ready to transform your gym?" | High |
| Subheadline | "Join 500+ gyms already using Pumpt" | High |
| CTA Button | "Start Your Free Trial" → /signup | High |
| Secondary Text | "No credit card required • 14-day free trial" | High |
| Background | Gradient or gym imagery | Medium |

##### Footer
| Element | Description | Priority |
|---------|-------------|----------|
| Logo | Pumpt logo | High |
| Navigation | Product, Company, Resources, Legal columns | High |
| Social Links | Twitter, LinkedIn, Instagram, Facebook | Medium |
| Newsletter | Email signup form | Low |
| Copyright | © 2026 Pumpt. All rights reserved. | High |
| Payment Icons | Paystack, Visa, Mastercard logos | Low |

#### 3.1.2 Business Rules

| Rule ID | Rule |
|---------|------|
| HOME-BR-001 | Hero CTA should be above the fold on all devices |
| HOME-BR-002 | Page load time must be < 3 seconds |
| HOME-BR-003 | All images must be optimized (WebP, lazy loading) |
| HOME-BR-004 | Testimonials should rotate or be randomized |

---

### 3.2 Features Page

**Route:** `/features`

**Purpose:** Detailed breakdown of all platform capabilities.

#### 3.2.1 Sections

##### Hero
| Element | Description |
|---------|-------------|
| Headline | "Powerful features for modern gyms" |
| Subheadline | "Everything you need to manage, grow, and scale your fitness business" |

##### Feature Categories
Each category links to a detailed sub-page.

| Category | Route | Description |
|----------|-------|-------------|
| Member Management | /features/member-management | Profiles, memberships, attendance |
| Class Scheduling | /features/class-scheduling | Schedules, bookings, waitlists |
| Payment Processing | /features/payments | Billing, invoices, Paystack integration |
| Website Builder | /features/website-builder | Custom branded gym websites |
| Analytics & Reports | /features/analytics | Revenue, retention, performance |

##### Feature Grid
| Element | Description |
|---------|-------------|
| Feature Card | Icon + Title + Description (2 lines) |
| Layout | 3-column grid (desktop), 1-column (mobile) |
| Count | 12-18 feature cards |

##### Detailed Features List

**Member Management**
- Member profiles with photos and contact info
- Membership plan assignment and tracking
- Membership expiry alerts and auto-renewal
- Member status management (active, suspended, etc.)
- Import/export member data (CSV)
- Member attendance tracking

**Class Scheduling**
- Weekly class schedule builder
- Trainer assignment per class
- Class capacity and waitlist management
- Member self-booking via member portal
- Booking reminders (email/SMS)
- No-show tracking and management

**Payment Processing**
- Paystack integration (cards, bank transfer, USSD)
- Automated recurring billing
- Payment receipts and invoices
- Failed payment retry and notifications
- Revenue tracking and reports
- Manual payment recording

**Website Builder**
- Custom branded gym landing page
- Logo, colors, and content customization
- SEO optimization (meta tags, sitemap)
- Mobile-responsive design
- Custom domain support (Pro+)
- Class schedule widget

**Analytics & Reports**
- Revenue dashboard (MRR, trends)
- Member growth and retention metrics
- Class attendance reports
- Trainer performance analytics
- Export reports (PDF, CSV)

##### Comparison Table (Optional)
| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Members | 100 | 500 | Unlimited |
| Custom Domain | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

##### CTA Section
| Element | Description |
|---------|-------------|
| Headline | "See Pumpt in action" |
| CTA | "Start Free Trial" / "Request Demo" |

---

### 3.3 Feature Sub-Pages

**Routes:** `/features/[feature-slug]`

Each feature category has a dedicated page with:

#### 3.3.1 Structure

| Section | Description |
|---------|-------------|
| Hero | Feature name, description, hero image/video |
| Benefits | 3-4 key benefits of this feature |
| How It Works | Step-by-step explanation with screenshots |
| Screenshots | 3-5 UI screenshots or GIFs |
| Related Features | Links to other feature pages |
| CTA | "Try it free" |

#### 3.3.2 Example: Member Management Page

**Route:** `/features/member-management`

| Section | Content |
|---------|---------|
| Headline | "Member Management Made Simple" |
| Subheadline | "Keep track of every member, from signup to renewal" |
| Benefit 1 | Complete member profiles at a glance |
| Benefit 2 | Automated membership tracking and alerts |
| Benefit 3 | Easy import from spreadsheets |
| Screenshots | Member list, profile view, add member form |

---

### 3.4 Pricing Page

**Route:** `/pricing`

**Purpose:** Clear presentation of subscription tiers to drive conversions.

#### 3.4.1 Sections

##### Hero
| Element | Description |
|---------|-------------|
| Headline | "Simple, transparent pricing" |
| Subheadline | "No hidden fees. Cancel anytime." |
| Toggle | Monthly / Annual (show savings) |

##### Pricing Cards

**Layout:** 3 cards side-by-side, middle card (Professional) highlighted as "Most Popular"

| Element | Description |
|---------|-------------|
| Plan Name | Starter / Professional / Enterprise |
| Price | ₦XX,XXX/month or $XX/month |
| Annual Price | Show monthly equivalent + "Save X%" |
| Description | One-line plan description |
| Features List | 8-10 features with checkmarks |
| CTA Button | "Start Free Trial" |
| Trial Note | "14-day free trial included" |

##### Plan Details

**Starter - ₦15,000/month**
- Up to 100 members
- Up to 3 trainers
- Up to 10 classes
- Basic analytics
- Email support
- Gym website (subdomain)

**Professional - ₦35,000/month** ⭐ Most Popular
- Up to 500 members
- Up to 10 trainers
- Up to 50 classes
- Advanced analytics
- Priority email support
- Custom domain
- Remove Pumpt branding
- API access (limited)

**Enterprise - ₦75,000/month**
- Unlimited members
- Unlimited trainers
- Unlimited classes
- Advanced analytics + exports
- Phone + email support
- Custom domain
- White-label (full branding control)
- Full API access
- Dedicated account manager
- Custom integrations

##### Feature Comparison Table
Full comparison of all features across plans with ✓ / ✗ / "Limited"

##### FAQ Section
| Question | Answer |
|----------|--------|
| Can I change plans later? | Yes, upgrade or downgrade anytime |
| Is there a free trial? | Yes, 14 days free on all plans |
| What payment methods? | Card, bank transfer, USSD via Paystack |
| Can I cancel anytime? | Yes, no long-term contracts |
| What happens when I exceed limits? | We'll notify you to upgrade |
| Do you offer discounts? | Annual billing saves 2 months |

##### Enterprise CTA
| Element | Description |
|---------|-------------|
| Headline | "Need a custom solution?" |
| Description | "For large gym chains and franchises" |
| CTA | "Contact Sales" |

#### 3.4.2 Business Rules

| Rule ID | Rule |
|---------|------|
| PRICE-BR-001 | Annual toggle shows savings percentage |
| PRICE-BR-002 | "Most Popular" badge on Professional plan |
| PRICE-BR-003 | Currency based on user location (NGN default) |
| PRICE-BR-004 | All prices include VAT |

---

### 3.5 About Page

**Route:** `/about`

**Purpose:** Build trust by sharing company story and team.

#### 3.5.1 Sections

| Section | Description |
|---------|-------------|
| Hero | "About Pumpt" + mission statement |
| Our Story | Company origin story (2-3 paragraphs) |
| Mission | What we're building and why |
| Values | 3-4 core company values with icons |
| Team | Founder/team photos with bios (optional) |
| Stats | Gyms served, members managed, etc. |
| CTA | "Join us" / "Start your free trial" |

#### 3.5.2 Suggested Content

**Mission Statement:**
"We believe every gym owner deserves powerful, affordable software to run their business. Pumpt was built by fitness enthusiasts who understand the unique challenges of managing a gym."

**Values:**
1. **Simplicity** - Easy to use, no training required
2. **Reliability** - Always available when you need it
3. **Support** - Real humans ready to help
4. **Growth** - Tools that scale with your business

---

### 3.6 Contact Page

**Route:** `/contact`

**Purpose:** Provide multiple ways to reach the company.

#### 3.6.1 Sections

##### Contact Form
| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| Email | Email | Yes |
| Phone | Tel | No |
| Company/Gym Name | Text | No |
| Subject | Select | Yes |
| Message | Textarea | Yes |
| Submit Button | "Send Message" | - |

**Subject Options:**
- General Inquiry
- Sales / Pricing Question
- Technical Support
- Partnership Opportunity
- Other

##### Contact Information
| Element | Description |
|---------|-------------|
| Email | hello@getpumpt.com |
| Phone | +234 XXX XXX XXXX |
| Address | Lagos, Nigeria (if applicable) |
| Hours | Mon-Fri 9am-6pm WAT |

##### Social Links
Links to Twitter, LinkedIn, Instagram, Facebook

##### Map (Optional)
Embedded Google Map if physical office exists

#### 3.6.2 Business Rules

| Rule ID | Rule |
|---------|------|
| CONT-BR-001 | Form submission sends email to support |
| CONT-BR-002 | Auto-reply confirmation sent to user |
| CONT-BR-003 | Form includes honeypot for spam prevention |
| CONT-BR-004 | Rate limit: 3 submissions per IP per hour |

---

### 3.7 Demo Page

**Route:** `/demo`

**Purpose:** Allow prospects to see the product before signing up.

#### 3.7.1 Options

**Option A: Video Demo**
| Element | Description |
|---------|-------------|
| Hero | "See Pumpt in Action" |
| Video Player | 3-5 minute product walkthrough video |
| Chapters | Clickable timestamps for different features |
| CTA | "Ready to try it? Start Free Trial" |

**Option B: Interactive Demo**
| Element | Description |
|---------|-------------|
| Hero | "Try Pumpt Now" |
| Demo Environment | Sandboxed demo with sample data |
| Guided Tour | Tooltips highlighting key features |
| CTA | "Create your own gym" |

**Option C: Request Demo (Enterprise)**
| Element | Description |
|---------|-------------|
| Hero | "Get a Personalized Demo" |
| Form | Name, Email, Phone, Gym Name, Size, Best Time |
| Confirmation | "We'll be in touch within 24 hours" |

#### 3.7.2 Recommended Approach
- Video demo for self-service (all visitors)
- Request demo form for enterprise prospects

---

### 3.8 Login Page

**Route:** `/login`

**Purpose:** Gym admin authentication portal.

#### 3.8.1 Elements

| Element | Description |
|---------|-------------|
| Logo | Pumpt logo |
| Headline | "Welcome back" |
| Email Field | Email input |
| Password Field | Password input with show/hide |
| Remember Me | Checkbox |
| Login Button | "Sign In" |
| Forgot Password | Link to /forgot-password |
| Signup Link | "Don't have an account? Start free trial" |
| OAuth | "Continue with Google" button |
| Background | Subtle gradient or gym imagery |

#### 3.8.2 Business Rules

| Rule ID | Rule |
|---------|------|
| LOGIN-BR-001 | Redirect to gym admin dashboard on success |
| LOGIN-BR-002 | Show error for invalid credentials |
| LOGIN-BR-003 | Lock account after 5 failed attempts |
| LOGIN-BR-004 | "Remember me" extends session to 30 days |

---

### 3.9 Signup Page

**Route:** `/signup` and `/signup/[plan]`

**Purpose:** New gym owner registration and trial activation.

#### 3.9.1 Signup Flow

**Step 1: Account Creation**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | Text | Yes | 2-50 chars |
| Last Name | Text | Yes | 2-50 chars |
| Email | Email | Yes | Valid, unique |
| Password | Password | Yes | Min 8 chars, 1 upper, 1 number |
| Phone | Tel | No | Valid format |

**Step 2: Gym Information**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Gym Name | Text | Yes | 2-100 chars |
| Gym Slug | Text (auto-generated) | Yes | URL-safe, unique |
| Country | Select | Yes | - |
| City | Text | No | - |

**Step 3: Plan Selection**
| Element | Description |
|---------|-------------|
| Plan Cards | 3 plans with features |
| Pre-selected | If came from /signup/[plan] |
| Trial Note | "All plans include 14-day free trial" |
| Skip Option | "Choose plan later" (defaults to Starter) |

**Step 4: Confirmation**
| Element | Description |
|---------|-------------|
| Summary | Account + Gym + Plan details |
| Terms | Checkbox to accept Terms & Privacy |
| Submit | "Create My Gym" |

#### 3.9.2 Post-Signup

| Action | Description |
|--------|-------------|
| Email Verification | Sent immediately |
| Welcome Email | With getting started guide |
| Redirect | To gym admin dashboard |
| Onboarding | First-time setup wizard |

#### 3.9.3 Business Rules

| Rule ID | Rule |
|---------|------|
| SIGNUP-BR-001 | Email must be unique across platform |
| SIGNUP-BR-002 | Gym slug auto-generated from name |
| SIGNUP-BR-003 | Gym slug must be unique |
| SIGNUP-BR-004 | Trial starts immediately (no card required) |
| SIGNUP-BR-005 | Default plan: Starter if not selected |
| SIGNUP-BR-006 | Account created with ADMIN role |

---

### 3.10 Forgot Password Page

**Route:** `/forgot-password`

#### 3.10.1 Elements

| Element | Description |
|---------|-------------|
| Logo | Pumpt logo |
| Headline | "Reset your password" |
| Description | "Enter your email and we'll send a reset link" |
| Email Field | Email input |
| Submit Button | "Send Reset Link" |
| Back to Login | Link to /login |
| Success State | "Check your email for reset instructions" |

---

### 3.11 Legal Pages

#### 3.11.1 Terms of Service

**Route:** `/terms`

| Section | Description |
|---------|-------------|
| Last Updated | Date |
| Introduction | Agreement to terms |
| Definitions | Key terms defined |
| Account Terms | Registration, responsibilities |
| Subscription & Billing | Payments, refunds, cancellation |
| Acceptable Use | What's allowed/prohibited |
| Intellectual Property | Ownership, licenses |
| Limitation of Liability | Legal protections |
| Termination | How accounts can be terminated |
| Governing Law | Jurisdiction |
| Contact | How to reach us |

#### 3.11.2 Privacy Policy

**Route:** `/privacy`

| Section | Description |
|---------|-------------|
| Last Updated | Date |
| Introduction | Commitment to privacy |
| Data Collection | What we collect |
| Data Usage | How we use it |
| Data Sharing | Third parties |
| Data Retention | How long we keep it |
| User Rights | Access, correction, deletion |
| Cookies | Cookie policy |
| Security | How we protect data |
| Children | Age restrictions |
| Changes | How we update policy |
| Contact | DPO or privacy contact |

---

## 4. Design Specifications

### 4.1 Brand Guidelines

#### 4.1.1 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #6366F1 (Indigo) | CTAs, links, accents |
| Primary Dark | #4F46E5 | Hover states |
| Primary Light | #818CF8 | Backgrounds, highlights |
| Secondary | #10B981 (Emerald) | Success, positive |
| Dark | #0F172A (Slate 900) | Text, dark backgrounds |
| Gray | #64748B (Slate 500) | Secondary text |
| Light | #F8FAFC (Slate 50) | Backgrounds |
| White | #FFFFFF | Cards, content areas |
| Error | #EF4444 (Red) | Errors, warnings |
| Warning | #F59E0B (Amber) | Alerts |

#### 4.1.2 Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Inter | Bold (700) | 48-64px |
| H2 | Inter | Semibold (600) | 36-48px |
| H3 | Inter | Semibold (600) | 24-30px |
| H4 | Inter | Medium (500) | 20-24px |
| Body | Inter | Regular (400) | 16-18px |
| Small | Inter | Regular (400) | 14px |
| Caption | Inter | Medium (500) | 12px |

**Font Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### 4.1.3 Spacing

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Default spacing |
| lg | 24px | Section padding |
| xl | 32px | Large gaps |
| 2xl | 48px | Section margins |
| 3xl | 64px | Hero sections |

#### 4.1.4 Border Radius

| Size | Value | Usage |
|------|-------|-------|
| sm | 4px | Small elements |
| md | 8px | Buttons, inputs |
| lg | 12px | Cards |
| xl | 16px | Large cards |
| full | 9999px | Pills, avatars |

### 4.2 Component Library

#### 4.2.1 Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| Primary | Filled, indigo | Main CTAs |
| Secondary | Outlined, indigo | Secondary actions |
| Ghost | Text only | Tertiary actions |
| Destructive | Filled, red | Delete, cancel |

**Button Sizes:**
- Small: 32px height, 14px text
- Medium: 40px height, 16px text
- Large: 48px height, 18px text

#### 4.2.2 Cards

| Type | Description |
|------|-------------|
| Feature Card | Icon + Title + Description |
| Pricing Card | Plan name + Price + Features + CTA |
| Testimonial Card | Quote + Author + Photo |
| Stat Card | Number + Label |

#### 4.2.3 Form Elements

| Element | Description |
|---------|-------------|
| Input | 40px height, rounded-md, border-gray-300 |
| Select | Same as input with dropdown |
| Textarea | Multi-line, resizable |
| Checkbox | 16px, rounded-sm |
| Toggle | Switch component |
| Error State | Red border, error message below |

### 4.3 Responsive Breakpoints

| Breakpoint | Width | Description |
|------------|-------|-------------|
| Mobile | < 640px | Single column |
| Tablet | 640-1024px | 2 columns |
| Desktop | > 1024px | Full layout |
| Large | > 1280px | Max-width container |

**Max Content Width:** 1280px (centered)

### 4.4 Animations & Interactions

| Element | Animation |
|---------|-----------|
| Page Load | Fade in + slight slide up |
| Buttons | Scale 1.02 on hover |
| Cards | Shadow increase on hover |
| Links | Color transition (200ms) |
| Modals | Fade + scale in |
| Scroll | Reveal animations on scroll |

---

## 5. SEO Requirements

### 5.1 Meta Tags per Page

| Page | Title | Description |
|------|-------|-------------|
| Home | Pumpt - Gym Management Software | The complete gym management platform. Manage members, schedule classes, process payments, and grow your fitness business. |
| Features | Features - Pumpt | Powerful features for modern gyms. Member management, class scheduling, payments, and more. |
| Pricing | Pricing - Pumpt | Simple, transparent pricing. Start free, upgrade as you grow. Plans from ₦15,000/month. |
| About | About Us - Pumpt | Learn about Pumpt's mission to help gym owners succeed. |
| Contact | Contact Us - Pumpt | Get in touch with the Pumpt team. We're here to help. |

### 5.2 Technical SEO

| Requirement | Description |
|-------------|-------------|
| Sitemap | Auto-generated sitemap.xml |
| Robots.txt | Allow all, disallow /admin |
| Canonical URLs | Set on all pages |
| Open Graph | OG tags for social sharing |
| Twitter Cards | Summary large image |
| Schema Markup | Organization, Product, FAQ |
| Page Speed | > 90 on Lighthouse |
| Mobile Friendly | Responsive design |

### 5.3 Content Requirements

| Page | Min Words | Keywords |
|------|-----------|----------|
| Home | 1000 | gym management software, fitness business |
| Features | 1500 | gym software features, member management |
| Pricing | 500 | gym software pricing, fitness software cost |

---

## 6. Analytics & Tracking

### 6.1 Events to Track

| Event | Trigger | Data |
|-------|---------|------|
| page_view | Page load | page_path, page_title |
| cta_click | CTA button click | button_text, page, destination |
| signup_start | Signup page view | referrer, plan |
| signup_complete | Account created | plan, source |
| demo_request | Demo form submit | form_data |
| pricing_view | Pricing page view | - |
| plan_select | Plan card click | plan_name |
| contact_submit | Contact form submit | subject |

### 6.2 Tools

| Tool | Purpose |
|------|---------|
| Google Analytics 4 | Traffic, behavior |
| Hotjar / Clarity | Heatmaps, recordings |
| Google Search Console | SEO monitoring |

---

## 7. Performance Requirements

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Page Size | < 1MB |

### 7.1 Optimization Strategies

- Next.js static generation for marketing pages
- Image optimization (WebP, lazy loading)
- Font optimization (subset, preload)
- Code splitting
- CDN for static assets
- Caching headers

---

## 8. Accessibility (WCAG 2.1 AA)

| Requirement | Description |
|-------------|-------------|
| Color Contrast | Min 4.5:1 for text |
| Keyboard Navigation | All interactive elements |
| Focus Indicators | Visible focus states |
| Alt Text | All images |
| Form Labels | Associated labels |
| Error Messages | Clear, descriptive |
| Skip Link | Skip to main content |
| Heading Hierarchy | Logical H1-H6 order |
| ARIA Labels | Where needed |

---

## 9. Localization (Future)

### 9.1 Supported Languages (Phase 2)

| Language | Code | Priority |
|----------|------|----------|
| English | en | Default |
| French | fr | High (West Africa) |
| Portuguese | pt | Medium |

### 9.2 Currency Support

| Currency | Code | Region |
|----------|------|--------|
| Nigerian Naira | NGN | Default |
| US Dollar | USD | International |
| British Pound | GBP | UK |

---

## 10. Implementation Priority

### Phase 1 (MVP)
1. Home Page
2. Pricing Page
3. Login Page
4. Signup Page (full flow)
5. Contact Page
6. Terms & Privacy

### Phase 2
7. Features Page (main)
8. Feature Sub-pages
9. About Page
10. Demo Page
11. Forgot Password

### Phase 3
12. Blog (if needed)
13. Help Center
14. Localization
15. A/B Testing

---

## 11. Content Checklist for Designer

### 11.1 Copy Needed

- [ ] Homepage hero headline and subheadline
- [ ] Feature descriptions (6 main features)
- [ ] Benefit statements (3-4)
- [ ] How it works steps (3)
- [ ] Testimonials (3 minimum)
- [ ] Pricing plan descriptions
- [ ] FAQ answers (6-8 questions)
- [ ] About page story
- [ ] CTA button text variations
- [ ] Error messages
- [ ] Success messages
- [ ] Email templates (welcome, verification)

### 11.2 Assets Needed

- [ ] Pumpt logo (SVG, PNG)
- [ ] Favicon (multiple sizes)
- [ ] Hero image/illustration
- [ ] Feature icons (12-18)
- [ ] Team photos (if applicable)
- [ ] Client/gym logos (4-6)
- [ ] Screenshot mockups of dashboard
- [ ] Social share images (OG)
- [ ] Testimonial author photos
- [ ] Background patterns/gradients

### 11.3 Illustrations Style

| Option | Description |
|--------|-------------|
| 3D | Modern 3D illustrations (Blush, etc.) |
| Flat | Flat vector illustrations |
| Isometric | Isometric style |
| Photos | Real gym/fitness photos |
| Abstract | Geometric shapes, gradients |

**Recommended:** Mix of real dashboard screenshots + simple illustrations for concepts

---

## 12. Handoff Notes for UI/UX Designer

### 12.1 Design Deliverables Expected

| Deliverable | Format | Description |
|-------------|--------|-------------|
| Design System | Figma | Colors, typography, components |
| Homepage | Figma | Desktop + Mobile |
| Features Page | Figma | Desktop + Mobile |
| Pricing Page | Figma | Desktop + Mobile |
| Login/Signup | Figma | Desktop + Mobile |
| All Other Pages | Figma | Desktop + Mobile |
| Prototype | Figma | Interactive prototype |
| Asset Export | PNG/SVG | Icons, illustrations |

### 12.2 Key Considerations

1. **Mobile-First:** Design mobile layouts first, then expand to desktop
2. **Conversion Focus:** Every page should have clear CTAs
3. **Trust Building:** Use testimonials, stats, logos throughout
4. **Speed:** Design for fast loading (minimal heavy assets)
5. **Consistency:** Use design system components throughout
6. **Accessibility:** Ensure sufficient contrast and touch targets

### 12.3 Competitor References

Research these for inspiration (not copying):
- Mindbody
- Gymmaster
- PushPress
- Wodify
- Glofox

### 12.4 Questions for Designer

1. What illustration style fits the brand?
2. Dark mode support needed?
3. Animation complexity level?
4. Custom illustrations vs. stock?

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Claude Code | Initial draft |
