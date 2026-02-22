# Functional Requirements Document (FRD)
# ZKBioCVAccess Integration - FitStudio Access Control

**Version:** 1.0
**Date:** February 2026
**Status:** Draft (Pending API License)
**Tenant:** FitStudio only (gym-scoped, not platform-wide)

---

## 1. Executive Summary

FitStudio has purchased ZKBioCVAccess (by ZKTeco) as their physical access control system for managing door entry via biometric/card readers. This document outlines the integration plan between GymFlow Pro and the ZKBio CVSecurity REST API to automate member access based on membership status.

**Prerequisite:** FitStudio must purchase and activate the `ZKBIOCV-API-S1` license module on their ZKBioCVAccess installation. Once activated, the "API Authorization" menu will appear in their ZKBio admin panel, allowing them to generate API credentials for GymFlow Pro.

**Related Documents:**
- [FRD-Gym-Admin-Portal.md](./FRD-Gym-Admin-Portal.md) - Gym admin dashboard
- [FRD-Member-Portal.md](./FRD-Member-Portal.md) - Member self-service

---

## 2. Architecture Overview

### 2.1 Integration Flow

```
GymFlow Pro (Vercel)
       |
       v
  Server Actions / Cron Jobs
       |
       v
  ZKBio API Client (src/lib/zk-bio/)
       |  HTTPS REST API
       v
  ZKBioCVAccess Server (FitStudio on-premise or hosted)
       |
       v
  Physical Door Controllers / Readers
```

### 2.2 Design Principles

- **Gym-scoped:** All ZKBio config and data is tied to FitStudio's `gymId`. No platform-wide changes.
- **Opt-in:** The integration is only active when `settings.zkBioAccess.enabled === true` on the Gym record.
- **Graceful degradation:** If the ZKBio server is unreachable, GymFlow continues to function normally. Access sync failures are logged, not thrown.
- **One-way source of truth:** GymFlow Pro is the source of truth for membership status. ZKBio is the downstream consumer.

---

## 3. Scope

### 3.1 In Scope

| Feature | Description |
|---------|-------------|
| Member sync | Push new members to ZKBio as persons when they join |
| Access grant | Assign access levels when membership is active |
| Access revoke | Remove access levels when membership expires, is cancelled, or paused |
| Access logs | Pull door entry/exit events from ZKBio for display in admin |
| Device status | Show connected device status in admin dashboard |
| Manual override | Admin can grant/revoke access independently of membership |
| Audit trail | Log all access control actions to ActivityLog |

### 3.2 Out of Scope

| Feature | Reason |
|---------|--------|
| Biometric enrollment | Done directly on ZKBio hardware/software |
| Door hardware config | Managed in ZKBioCVAccess admin panel |
| Multi-gym support | FitStudio only for now; pattern supports future expansion |
| Real-time push from ZKBio | ZKBio webhooks not confirmed; we poll via cron |

---

## 4. Prerequisites from FitStudio

Before development begins, FitStudio must provide:

| Item | Description |
|------|-------------|
| API License | `ZKBIOCV-API-S1` activated on their ZKBioCVAccess |
| API Base URL | The ZKBio server address (e.g., `https://192.168.1.100:8098`) |
| API Credentials | Client ID and secret generated from ZKBio API Authorization panel |
| Network Access | ZKBio server must be reachable from Vercel (public IP or VPN/tunnel) |
| Access Level Name | The access level(s) configured in ZKBio for gym entry (e.g., "Gym Floor", "All Areas") |

---

## 5. Database Schema Changes

### 5.1 New Models

```prisma
model GymIntegration {
  id           String             @id @default(cuid())
  gymId        String
  provider     IntegrationProvider
  name         String
  config       Json               // Encrypted connection details
  isActive     Boolean            @default(false)
  lastSyncAt   DateTime?
  lastSyncStatus String?          // "success" | "error" | "partial"
  lastError    String?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  gym          Gym                @relation(fields: [gymId], references: [id], onDelete: Cascade)

  @@unique([gymId, provider])
  @@index([gymId])
  @@map("gym_integrations")
}

model AccessControlPerson {
  id             String   @id @default(cuid())
  gymId          String
  userId         String
  externalId     String   // ZKBio person ID
  accessGranted  Boolean  @default(false)
  accessLevelId  String?  // ZKBio access level ID
  lastSyncAt     DateTime?
  syncStatus     String   @default("pending") // "synced" | "pending" | "error"
  syncError      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  gym            Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([gymId, userId])
  @@unique([gymId, externalId])
  @@index([gymId])
  @@index([userId])
  @@map("access_control_persons")
}

model AccessControlLog {
  id            String   @id @default(cuid())
  gymId         String
  userId        String?  // Null if person not matched in our system
  externalId    String   // ZKBio person ID
  eventType     String   // "entry" | "exit" | "denied" | "alarm"
  doorName      String
  deviceSerial  String
  occurredAt    DateTime
  rawData       Json?    // Full ZKBio event payload
  createdAt     DateTime @default(now())
  gym           Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)
  user          User?    @relation(fields: [userId], references: [id])

  @@index([gymId])
  @@index([userId])
  @@index([occurredAt])
  @@map("access_control_logs")
}

enum IntegrationProvider {
  ZKBIO_CVACCESS
}
```

### 5.2 Model Relation Updates

Add to existing `Gym` model:
```prisma
integrations        GymIntegration[]
accessControlPersons AccessControlPerson[]
accessControlLogs   AccessControlLog[]
```

Add to existing `User` model:
```prisma
accessControlPerson AccessControlPerson?
accessControlLogs   AccessControlLog[]
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Core API Client + Database)

**Goal:** Establish the ZKBio API client, database models, and gym-level configuration.

#### 6.1.1 Files to Create

| File | Purpose |
|------|---------|
| `src/lib/zk-bio/client.ts` | HTTP client for ZKBio CVSecurity REST API |
| `src/lib/zk-bio/types.ts` | TypeScript types for ZKBio API requests/responses |
| `src/lib/zk-bio/endpoints.ts` | API endpoint constants and path builders |
| `src/lib/validations/zk-bio.ts` | Zod schemas for ZKBio configuration and payloads |

#### 6.1.2 ZKBio API Client

The client must handle:
- **Token-based auth:** Obtain and refresh access tokens using client credentials
- **Base URL configuration:** Per-gym base URL from `GymIntegration.config`
- **Error handling:** Timeout, network errors, auth failures - all non-throwing, return result types
- **Logging:** All API calls logged for debugging

Key API endpoints to implement:

| ZKBio Endpoint | Method | Purpose |
|----------------|--------|---------|
| `/api/token` | POST | Obtain access token |
| `/api/person/add` | POST | Create a person |
| `/api/person/update` | PUT | Update person details |
| `/api/person/delete` | DELETE | Remove a person |
| `/api/person/list` | GET | List all persons |
| `/api/accessLevel/list` | GET | List access levels |
| `/api/accessLevel/assignPerson` | POST | Grant access level to person |
| `/api/accessLevel/removePerson` | POST | Revoke access level from person |
| `/api/transaction/list` | GET | Fetch access events/transactions |
| `/api/device/list` | GET | List connected devices |
| `/api/door/list` | GET | List doors |
| `/api/door/open` | POST | Remote door unlock |

#### 6.1.3 Gym Integration Config

Stored in `GymIntegration.config` (encrypted JSON):

```typescript
interface ZKBioConfig {
  baseUrl: string        // e.g., "https://192.168.1.100:8098"
  clientId: string       // From ZKBio API Authorization
  clientSecret: string   // From ZKBio API Authorization
  defaultAccessLevelId: string  // ZKBio access level for gym entry
  syncIntervalMinutes: number   // How often to pull access logs (default: 15)
  autoSyncMembers: boolean      // Auto-push new members to ZKBio
  autoRevokeOnExpiry: boolean   // Auto-revoke on membership expiry
}
```

#### 6.1.4 Database Migration

- Add new models to `schema.prisma`
- Run migration: `prisma migrate dev --name add-access-control-integration`

---

### Phase 2: Member Sync (GymFlow -> ZKBio)

**Goal:** Automatically sync members to ZKBio when membership events occur.

#### 6.2.1 Files to Create

| File | Purpose |
|------|---------|
| `src/lib/actions/access-control.ts` | Server actions for access control operations |
| `src/lib/zk-bio/sync.ts` | Sync logic: member push, access grant/revoke |

#### 6.2.2 Sync Triggers

| Event | Action | Implementation |
|-------|--------|----------------|
| Membership activated | Create person in ZKBio + assign access level | Hook into existing membership creation flow |
| Membership expired | Remove access level from person | Cron job checks daily |
| Membership cancelled | Remove access level from person | Hook into cancellation flow |
| Membership paused | Remove access level from person | Hook into pause flow |
| Membership renewed | Re-assign access level to person | Hook into renewal flow |
| Member status set to SUSPENDED | Remove access level | Hook into status change |
| Admin manual override | Grant/revoke via admin UI | Server action |

#### 6.2.3 Server Actions

```typescript
// src/lib/actions/access-control.ts

syncMemberToZKBio(gymId: string, userId: string)
  // Creates or updates person in ZKBio, sets access based on membership status

revokeMemberAccess(gymId: string, userId: string)
  // Removes access level from person in ZKBio

grantMemberAccess(gymId: string, userId: string, accessLevelId?: string)
  // Assigns access level to person in ZKBio

bulkSyncMembers(gymId: string)
  // Full sync of all active members (used for initial setup or recovery)

getAccessControlStatus(gymId: string, userId: string)
  // Returns current access status for a member

testConnection(gymId: string)
  // Verifies ZKBio API connectivity and credentials
```

#### 6.2.4 Integration with Existing Flows

Modify these existing files to add ZKBio sync hooks:
- `src/lib/actions/members.ts` - After member creation/status change
- `src/lib/actions/payments.ts` - After successful payment activates membership
- Membership expiry cron - After expiring memberships

Pattern: Call sync functions in a fire-and-forget manner so failures don't block the primary operation.

```typescript
// Example: After membership activation
const membership = await prisma.membership.create({ ... })

// Fire-and-forget ZKBio sync
syncMemberToZKBio(gymId, userId).catch((error) => {
  logActivity({
    gymId,
    userId: staffId,
    action: 'SYNC_ERROR',
    resourceType: 'ACCESS_CONTROL',
    resourceId: userId,
    description: `Failed to sync member access: ${error.message}`,
  })
})
```

---

### Phase 3: Access Logs + Admin UI

**Goal:** Pull access events from ZKBio and display them in the admin portal.

#### 6.3.1 Files to Create

| File | Purpose |
|------|---------|
| `src/app/(admin)/admin/access-control/page.tsx` | Access control dashboard |
| `src/app/(admin)/admin/access-control/devices/page.tsx` | Device list and status |
| `src/app/(admin)/admin/access-control/logs/page.tsx` | Access event log viewer |
| `src/app/(admin)/admin/access-control/members/page.tsx` | Member access management |
| `src/app/(admin)/admin/access-control/settings/page.tsx` | Integration configuration |
| `src/components/admin/access-control/` | Shared components for access control pages |

#### 6.3.2 Admin Pages

**Dashboard (`/admin/access-control`)**
- Today's entry count
- Active access grants vs total members
- Last sync status and timestamp
- Recent access events (last 10)
- Device connection status summary

**Access Logs (`/admin/access-control/logs`)**
- Filterable table: date range, member name, event type, door
- Real-time-ish updates (auto-refresh every 30 seconds)
- Export to CSV

**Member Access (`/admin/access-control/members`)**
- List of all members with their access status (granted/revoked/pending/error)
- Quick actions: grant, revoke, re-sync
- Bulk actions: sync all, revoke all expired
- Filter by: access status, membership status

**Devices (`/admin/access-control/devices`)**
- List of connected door controllers/readers
- Online/offline status
- Remote door unlock button (with confirmation dialog)

**Settings (`/admin/access-control/settings`)**
- ZKBio connection config (base URL, credentials)
- Test connection button
- Default access level selector (fetches from ZKBio API)
- Auto-sync toggles
- Sync interval configuration
- Manual full sync button

#### 6.3.3 Permissions

Add to `src/lib/permissions.ts`:

```typescript
| 'access-control:view'
| 'access-control:manage'
| 'access-control:logs'
```

Role assignments:
- **STAFF:** `access-control:view`, `access-control:logs`
- **ADMIN:** All three
- **SUPER_ADMIN:** All three

#### 6.3.4 Navigation

Add to `ADMIN_NAV_ITEMS` in `src/lib/permissions.ts`:

```typescript
{
  href: '/admin/access-control',
  label: 'Access Control',
  iconKey: 'access-control',
  requiredPermission: 'access-control:view'
}
```

**Conditional visibility:** This nav item should only render for gyms that have a `GymIntegration` with `provider: ZKBIO_CVACCESS` and `isActive: true`.

---

### Phase 4: Cron Jobs + Automated Sync

**Goal:** Background jobs to keep access in sync and pull logs.

#### 6.4.1 Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/cron/sync-access-control/route.ts` | Pull access logs + expire access |

#### 6.4.2 Cron Job: Sync Access Control

Runs every 15 minutes (configurable per gym). Performs:

1. **Pull access logs** - Fetch new transactions from ZKBio since last sync, insert into `AccessControlLog`
2. **Expire access** - Find members with expired/cancelled memberships that still have `accessGranted: true`, revoke in ZKBio
3. **Retry failed syncs** - Re-attempt any `AccessControlPerson` records with `syncStatus: "error"`
4. **Update sync status** - Set `GymIntegration.lastSyncAt` and `lastSyncStatus`

```typescript
// Vercel cron config (vercel.json)
{
  "crons": [
    {
      "path": "/api/cron/sync-access-control",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

#### 6.4.3 Authentication

Same pattern as existing cron jobs - verify `CRON_SECRET` bearer token.

---

## 7. Environment Variables

```bash
# No global ZKBio env vars needed.
# All config is per-gym in GymIntegration.config.
# Exception: encryption key for storing credentials securely.

INTEGRATION_ENCRYPTION_KEY=   # AES-256 key for encrypting GymIntegration.config secrets
```

---

## 8. Security Considerations

| Concern | Mitigation |
|---------|------------|
| API credentials stored in DB | Encrypt `clientSecret` in `GymIntegration.config` using `INTEGRATION_ENCRYPTION_KEY` |
| ZKBio server exposure | FitStudio should use HTTPS; recommend Cloudflare Tunnel if on-premise |
| Network access from Vercel | FitStudio must whitelist Vercel's IP ranges or use a tunnel |
| Permission escalation | Access control pages gated by `access-control:*` permissions |
| Cross-tenant leakage | All queries filtered by `gymId`; `GymIntegration` is `@@unique([gymId, provider])` |
| Credential rotation | Settings page allows updating credentials without downtime |

---

## 9. Error Handling Strategy

| Scenario | Behavior |
|----------|----------|
| ZKBio server unreachable | Log error, set `syncStatus: "error"`, retry on next cron run |
| Invalid credentials | Log error, set `lastError`, show warning in admin settings |
| Member sync fails | Mark `AccessControlPerson.syncStatus: "error"`, show in member access list |
| Partial bulk sync failure | Continue with remaining members, report count of failures |
| Rate limiting from ZKBio | Implement exponential backoff in API client |

---

## 10. Testing Plan

### Unit Tests
- ZKBio API client (mocked HTTP)
- Sync logic (member push, access grant/revoke)
- Config validation (Zod schemas)
- Encryption/decryption of credentials

### Integration Tests
- Server actions with mocked ZKBio API
- Cron job with mocked ZKBio API
- Membership lifecycle triggers access sync

### E2E Tests
- Admin configures ZKBio integration (settings page)
- Admin views access logs
- Admin manually grants/revokes member access
- Member access auto-revoked on membership expiry (simulated)

---

## 11. File Structure Summary

```
src/
  app/
    (admin)/admin/access-control/
      page.tsx                    # Dashboard
      devices/page.tsx            # Device status
      logs/page.tsx               # Access event logs
      members/page.tsx            # Member access management
      settings/page.tsx           # Integration config
    api/cron/
      sync-access-control/
        route.ts                  # Periodic sync cron
  components/admin/access-control/
    access-log-table.tsx          # Log table with filters
    device-status-card.tsx        # Device online/offline card
    member-access-table.tsx       # Member access list
    sync-status-badge.tsx         # Sync status indicator
    connection-test-button.tsx    # Test ZKBio connectivity
  lib/
    zk-bio/
      client.ts                   # HTTP client for ZKBio REST API
      types.ts                    # TypeScript types
      endpoints.ts                # API endpoint constants
      sync.ts                     # Sync logic
    actions/
      access-control.ts           # Server actions
    validations/
      zk-bio.ts                   # Zod schemas
prisma/
  schema.prisma                   # + GymIntegration, AccessControlPerson, AccessControlLog
```

---

## 12. Implementation Checklist

### Phase 1: Foundation
- [ ] Add database models to `schema.prisma`
- [ ] Run migration
- [ ] Create `src/lib/zk-bio/types.ts` with API types
- [ ] Create `src/lib/zk-bio/endpoints.ts` with endpoint constants
- [ ] Create `src/lib/zk-bio/client.ts` with HTTP client
- [ ] Create `src/lib/validations/zk-bio.ts` with Zod schemas
- [ ] Add `INTEGRATION_ENCRYPTION_KEY` env var
- [ ] Write unit tests for API client

### Phase 2: Member Sync
- [ ] Create `src/lib/zk-bio/sync.ts`
- [ ] Create `src/lib/actions/access-control.ts`
- [ ] Hook into membership activation flow
- [ ] Hook into membership expiry/cancellation/pause flows
- [ ] Hook into member status change flow
- [ ] Write integration tests for sync logic

### Phase 3: Admin UI
- [ ] Add permissions to `src/lib/permissions.ts`
- [ ] Add nav item (conditional on integration being active)
- [ ] Build settings page with connection config
- [ ] Build member access management page
- [ ] Build access logs page
- [ ] Build device status page
- [ ] Build dashboard overview page
- [ ] Write E2E tests for admin flows

### Phase 4: Cron Jobs
- [ ] Create sync cron route
- [ ] Add cron config to `vercel.json`
- [ ] Test cron with mock data
- [ ] Write integration tests for cron

---

## 13. Future Considerations

- **Other gyms adopting ZKBio:** The `GymIntegration` model already supports this. Another gym just adds their own config.
- **Other access control providers:** Add new `IntegrationProvider` enum values. The `GymIntegration` model is provider-agnostic.
- **Real-time events:** If ZKBio supports webhooks in a future version, add a webhook endpoint at `/api/webhooks/zkbio/` following the Paystack webhook pattern.
- **Biometric enrollment via GymFlow:** Would require ZKBio's biometric template API endpoints, which are available in the REST API.
- **QR code / mobile access:** Could be layered on top, generating temporary access tokens that ZKBio validates.
