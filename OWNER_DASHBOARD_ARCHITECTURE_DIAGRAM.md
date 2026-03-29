# Owner Dashboard - System Architecture Diagram

## Complete Security Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                         Verdustry PLATFORM                                │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
        ┌─────────────┐       ┌─────────────┐      ┌──────────────┐
        │   login     │       │  REGISTER   │      │   FORGOT     │
        │             │       │             │      │   PASSWORD   │
        │ Auth Check  │       │ Create User │      │              │
        │             │       │             │      │              │
        └──────┬──────┘       └──────┬──────┘      └──────┬───────┘
               │                      │                    │
               └──────────────────────┼────────────────────┘
                                      │
                    ┌─────────────────────────────┐
                    │   localStorage              │
                    ├─────────────────────────────┤
                    │ • token                     │
                    │ • is_super_admin (T/F)      │
                    │ • user_id                   │
                    │ • business_name             │
                    │ • profile_picture           │
                    └─────────────────────────────┘
                                      │
                    ┌─────────────────────────────┐
                    │  Route Resolver (App.tsx)   │
                    │                             │
                    │ Is Super Admin?             │
                    │  ├─ Yes → Protected Route   │
                    │  └─ No  → Public Route      │
                    └────────┬────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
      ┌────────────┐  ┌──────────────┐  ┌──────────────┐
      │Protected  │  │Regular       │  │Public        │
      │AdminRoute │  │Dashboard     │  │Pages         │
      │Component  │  │Layout        │  │(Home, etc)   │
      │           │  │              │  │              │
      │Checks:    │  │Features:     │  │              │
      │• Token    │  │• Dashboard   │  │              │
      │• S.Admin  │  │• Analytics   │  │              │
      │• User ID  │  │• Emissions   │  │              │
      │           │  │• Reports     │  │              │
      │Redirect:  │  │• Goals       │  │              │
      │• /dash... │  │              │  │              │
      │• /login   │  │ConditionalUI:│  │              │
      │           │  │"Owner Dash"  │  │              │
      │Logs:      │  │link if admin │  │              │
      │✅/❌      │  │              │  │              │
      └────┬──────┘  └──────────────┘  └──────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │    SuperAdminLayout Component            │
    │                                          │
    │    ┌────────────────────────────────┐   │
    │    │  Header                        │   │
    │    │  ├─ Security Banner            │   │
    │    │  │  "🔒 Restricted Access"    │   │
    │    │  │                             │   │
    │    │  ├─ Title: "Owner Dashboard"   │   │
    │    │  ├─ Status: "Administrator"    │   │
    │    │  └─ Icon: 👑                   │   │
    │    └────────────────────────────────┘   │
    │    ┌────────────────────────────────┐   │
    │    │  Sidebar                       │   │
    │    │  ├─ 🏠 Dashboard               │   │
    │    │  ├─ 👥 User Management         │   │
    │    │  ├─ ⚙️ System Settings         │   │
    │    │  └─ 🚪 Logout                  │   │
    │    └────────────────────────────────┘   │
    │    ┌────────────────────────────────┐   │
    │    │  Content Area                  │   │
    │    │  ├─ Dashboard Overview         │   │
    │    │  ├─ Admin Pages                │   │
    │    │  └─ Nested Routes              │   │
    │    └────────────────────────────────┘   │
    └──────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │    Admin Dashboard Routes                │
    │                                          │
    │    /admin-dashboard                      │
    │    ├─ /users                             │
    │    │  └─ UserManagementTab               │
    │    │     ├─ "Add New User" Modal         │
    │    │     ├─ Form Fields                  │
    │    │     │  ├─ Full Name                 │
    │    │     │  ├─ Email                     │
    │    │     │  ├─ Password                  │
    │    │     │  ├─ Confirm Password          │
    │    │     │  └─ Role Selection            │
    │    │     └─ User List Table              │
    │    │        ├─ Name                      │
    │    │        ├─ Email                     │
    │    │        ├─ Roles                     │
    │    │        ├─ Created Date              │
    │    │        └─ Actions                   │
    │    │           ├─ Assign Roles           │
    │    │           └─ Delete User            │
    │    │                                     │
    │    └─ /settings                          │
    │       └─ SettingsTab                     │
    │          ├─ System Configuration         │
    │          ├─ Platform Settings            │
    │          └─ Admin Preferences            │
    │                                          │
    └──────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │    Backend Security Verification         │
    │                                          │
    │    POST /api/super-admin/create-user     │
    │    ├─ Verify Token                       │
    │    ├─ Check is_super_admin = true        │
    │    ├─ Validate Email Unique              │
    │    ├─ Hash Password                      │
    │    ├─ Assign Roles                       │
    │    ├─ Log Operation                      │
    │    └─ Return Response                    │
    │                                          │
    │    All other /api/super-admin/* routes   │
    │    follow same security pattern          │
    │                                          │
    └──────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │    Database                              │
    │                                          │
    │    Users Table                           │
    │    ├─ id (Primary Key)                   │
    │    ├─ email                              │
    │    ├─ password (hashed)                  │
    │    ├─ business_name                      │
    │    ├─ is_super_admin (Boolean)           │
    │    └─ created_at                         │
    │                                          │
    │    User_Roles Table (Junction)           │
    │    ├─ user_id (FK)                       │
    │    └─ role_id (FK)                       │
    │                                          │
    │    Roles Table                           │
    │    ├─ id (Primary Key)                   │
    │    ├─ name                               │
    │    └─ description                        │
    │                                          │
    │    Permissions Table                     │
    │    ├─ id (Primary Key)                   │
    │    └─ name                               │
    │                                          │
    └──────────────────────────────────────────┘
```

---

## Authentication & Authorization Flow

```
USER login
   │
   ▼
┌─────────────────────────────────┐
│ Verify Credentials              │
│ - Email validation              │
│ - Password hashing/comparison   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Create Session                  │
│ - Generate token                │
│ - Set is_super_admin flag       │
│ - Store user_id                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Save to localStorage            │
│ - token                         │
│ - is_super_admin (true/false)   │
│ - user_id                       │
│ - business_name                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Route to Dashboard              │
│                                 │
│ Check: is_super_admin?          │
│  ├─ TRUE  → /admin-dashboard    │
│  └─ FALSE → /dashboard          │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
ADMIN    REGULAR
DASH.    DASH.
```

---

## Security Validation Layers

```
REQUEST TO /admin-dashboard

┌─────────────────────────────────────────┐
│ LAYER 1: Frontend Token Check           │
│ localStorage.getItem("token") exists?   │
│ ├─ YES → Continue                       │
│ └─ NO  → Redirect to /login             │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ LAYER 2: Frontend Super Admin Check     │
│ localStorage.getItem("is_super_admin")  │
│ === "true"?                             │
│ ├─ YES → Continue                       │
│ └─ NO  → Redirect to /dashboard         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ LAYER 3: Frontend User ID Check         │
│ localStorage.getItem("user_id") exists? │
│ ├─ YES → Continue                       │
│ └─ NO  → Redirect to /login             │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ LAYER 4: Backend DB Verification        │
│ SELECT is_super_admin FROM users        │
│ WHERE id = user_id                      │
│ ├─ TRUE → Grant Access                  │
│ └─ FALSE → 403 Forbidden                │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ ✅ ACCESS GRANTED                       │
│ Render SuperAdminLayout with content    │
│ Log: "Owner Dashboard access granted"   │
└─────────────────────────────────────────┘
```

---

## User Creation Workflow

```
Owner Clicks "Add New User"
        │
        ▼
Modal Form Opens
├─ Full Name Input
├─ Email Input
├─ Password Input
├─ Confirm Password Input
└─ Role Selection (Checkboxes)
        │
        ▼
┌──────────────────────────────────┐
│ Frontend Validation              │
├──────────────────────────────────┤
│ ✓ All fields filled?             │
│ ✓ Password >= 6 characters?      │
│ ✓ Password matches confirmation? │
│ ✓ Valid email format?            │
│ ✓ At least one role selected?    │
└────────┬─────────────────────────┘
         │
    ┌────┴────────┐
    ▼             ▼
  INVALID        VALID
  (Show error) (Continue)
               │
               ▼
        ┌──────────────────────┐
        │ API Call             │
        │ POST /api/super-admin│
        │ /create-user         │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │ Backend Validation (L1)  │
        │ - Token exists?          │
        │ - User authenticated?    │
        └────────┬─────────────────┘
                 │
            ┌────┴────┐
            ▼         ▼
          YES        NO
          │          └─→ 401 Unauthorized
          │
          ▼
    ┌──────────────────────────┐
    │ Backend Validation (L2)  │
    │ - is_super_admin=true?   │
    └────────┬─────────────────┘
             │
        ┌────┴────┐
        ▼         ▼
      YES        NO
      │          └─→ 403 Forbidden
      │             "Super admin required"
      │
      ▼
    ┌──────────────────────────┐
    │ Backend Validation (L3)  │
    │ - Email already exists?  │
    └────────┬─────────────────┘
             │
        ┌────┴────┐
        ▼         ▼
      NO         YES
      │          └─→ 409 Conflict
      │             "Email exists"
      │
      ▼
    ┌──────────────────────────┐
    │ Backend Execution        │
    │ - Hash password          │
    │ - Create user            │
    │ - Assign roles           │
    │ - Log operation          │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Response                 │
    │ {                        │
    │   success: true,         │
    │   user_id: 42,           │
    │   message: "Created...", │
    │   created_by: "owner..."│
    │ }                        │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Frontend Update          │
    │ - Hide modal             │
    │ - Show success alert     │
    │ - Add to user list       │
    │ - Auto-dismiss (5s)      │
    └──────────────────────────┘
```

---

## Component Hierarchy

```
App
├── loginPage
│   └── loginForm
├── RegisterPage
│   └── RegisterForm
├── HomePage
│
├── Protected Routes ────────────────────┐
│   └── ProtectedAdminRoute              │
│       └── SuperAdminLayout             │ (Owner Dashboard)
│           ├── Header                   │
│           │   ├── Security Banner      │
│           │   └── Admin Status         │
│           ├── Sidebar                  │
│           │   ├── Dashboard Link       │
│           │   ├── User Management Link │
│           │   ├── Settings Link        │
│           │   └── Logout Button        │
│           └── Content Routes           │
│               ├── AdminDashboard       │
│               ├── AdminUsersPage       │
│               │   └── UserManagementTab│
│               │       ├── "Add User" Modal
│               │       └── User List Table
│               └── AdminSettingsPage    │
│                   └── SettingsTab      │
│                                        │
└────────────────────────────────────────┘

├── Public Routes ──────────────────────┐
    └── DashboardLayout (Regular Users) │
        ├── Header                      │
        ├── Sidebar (5 nav items)       │
        │   ├── Dashboard               │
        │   ├── Analytics               │
        │   ├── Emissions               │
        │   ├── Reports                 │
        │   └── Goals                   │
        ├── Profile Dropdown            │
        │   ├── Owner Dashboard (admin) │
        │   ├── Settings                │
        │   ├── Support                 │
        │   └── Logout                  │
        └── Content Routes              │
            ├── DashboardOverview       │
            ├── AnalyticsTab            │
            ├── EmissionsLogTab         │
            ├── ReportsTab              │
            ├── GoalsTab                │
            ├── SettingsTab             │
            ├── SupportTab              │
            └── RoleManagementTab       │
```

---

## Security Logging Flow

```
User Action
    │
    ▼
┌─────────────────────────────────┐
│ Frontend Logging (Browser)      │
│                                 │
│ console.log(                    │
│   "✅ Access granted",          │
│   {user_id, path, time}         │
│ )                               │
│                                 │
│ or                              │
│                                 │
│ console.warn(                   │
│   "❌ Access Denied",           │
│   {reason, user, time}          │
│ )                               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend Logging (Server)        │
│                                 │
│ logger.info(                    │
│   "✅ User created by admin",   │
│   {created_user, created_by}    │
│ )                               │
│                                 │
│ or                              │
│                                 │
│ logger.warning(                 │
│   "🚨 Unauthorized attempt",    │
│   {user_id, action, time}       │
│ )                               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Available in:                   │
│ • Browser DevTools Console      │
│ • Server Log Files              │
│ • Monitoring Dashboard          │
└─────────────────────────────────┘
```

---

## File Organization

```
Verdustry/
├── Verdustry-frontend/
│   └── src/
│       ├── App.tsx (Routes config)
│       ├── components/
│       │   └── ProtectedAdminRoute.tsx
│       └── features/dashboard/
│           └── components/
│               ├── DashboardLayout.tsx
│               ├── SuperAdminLayout.tsx
│               ├── UserManagementTab.tsx
│               ├── pages/
│               │   ├── AdminUsersPage.tsx
│               │   └── AdminSettingsPage.tsx
│               └── other components...
│
├── Verdustry-backend/
│   ├── main.py
│   ├── super_admin_routes.py
│   ├── role_utils.py
│   ├── models.py
│   ├── database.py
│   └── other files...
│
└── Documentation/
    ├── OWNER_DASHBOARD_SECURITY.md
    ├── OWNER_DASHBOARD_SECURITY_TESTS.md
    ├── OWNER_DASHBOARD_QUICK_REFERENCE.md
    └── OWNER_DASHBOARD_FINAL_IMPLEMENTATION_REPORT.md
```

---

This architecture ensures complete isolation and security of the Owner Dashboard while maintaining a clear, logical flow for all user interactions.

**Security Level**: 🔒🔒🔒 HIGH
**Status**: ✅ COMPLETE & PRODUCTION READY
