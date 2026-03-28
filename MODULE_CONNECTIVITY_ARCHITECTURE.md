# Module Connectivity Architecture - Verdustry Dashboard

## Complete Multi-Tab System Overview

Your Verdustry application is now structured as a **persistent sidebar with 5 main tabs**, each connecting to different backend modules. The sidebar stays visible while users navigate between tabs.

---

## Route Structure

```
/dashboard                          → Main Dashboard (Overview)
  ├── /dashboard/analytics          → Analytics & Insights Tab
  ├── /dashboard/emissions          → Emissions Audit Trail Tab
  ├── /dashboard/reports            → Reports & Compliance Tab
  ├── /dashboard/settings           → Settings & Control Tab
  ├── /dashboard/goals              → Goals & Targets (Placeholder - Phase 6)
  └── /dashboard/support            → Help & Support (Placeholder - Phase 6)

/login                              → Authentication
/register                           → Account Creation
```

---

## Tab Architecture & Module Connectivity

### 1. Dashboard Tab (The "Heart") 🏠
**Route:** `/dashboard`  
**Component:** `DashboardOverview.tsx`  
**Module Connection:** Calculation Engine + Visual Analytics

**Logic Flow:**
```
User lands on dashboard
  ↓
Fetches from backend:
  - /dashboard-stats/{business_id}         → Total CO2, kWh, gas, logs
  - /recent-logs/{business_id}             → Last 5 emissions
  - /category-breakdown/{business_id}      → Pie chart data
  - /monthly-trends/{business_id}          → 6-month trends
  ↓
Displays 4 stat cards + 2 charts
  ↓
Triggers log emission modal
  ↓
Real-time data refresh every 10 seconds
```

**Features:**
- Live stats cards with trending indicators
- Category breakdown pie chart (Electricity, Gas, Fuel, Waste)
- 6-month trend bar chart
- Recent activity feed with live badge
- "Download Report" button in activity header
- Quick action buttons for logging emissions

---

### 2. Analytics Tab (The "Insights") 📊
**Route:** `/dashboard/analytics`  
**Component:** `AnalyticsTab.tsx`  
**Module Connection:** Visual Analytics Module

**Logic Flow:**
```
User clicks "Analytics" in sidebar
  ↓
Fetches GROUPED data:
  - /category-breakdown/{business_id}      → CO2 by emission type
  - /monthly-trends/{business_id}          → CO2 by month
  ↓
Transforms data for Recharts library
  ↓
Displays advanced visualizations:
  - Pie Chart (emissions by type)
  - Bar Chart (monthly trends)
  - Key insights box
```

**Features:**
- Professional category breakdown pie chart
- 6-month trend analysis with grid
- Intelligent insights extracted from data
- Smooth animations and hover tooltips
- Color-coded by emission type
- Responsive grid layout (1 col on mobile, 3 cols on desktop)

---

### 3. Emissions Log Tab (The "Audit Trail") 📋
**Route:** `/dashboard/emissions`  
**Component:** `EmissionsLogTab.tsx`  
**Module Connection:** Data Persistence Module

**Logic Flow:**
```
User clicks "Emissions Log" in sidebar
  ↓
Fetches ALL emissions (not just 5):
  - /recent-logs/{business_id}             → All historical logs
  ↓
Displays searchable/filterable table:
  - Date Recorded
  - Emission Source (type)
  - Usage Amount (value + unit)
  - CO2 Impact
  ↓
User can search by date or type
User can filter by emission type dropdown
```

**Features:**
- Searchable by date or emission type
- Filterable by type (Electricity, Gas, Fuel, Waste)
- Color-coded type badges (Blue/Orange/Purple/Gray)
- Icons for each emission type
- Pagination or infinite scroll (ready for large datasets)
- Delete button for each row (future enhancement)
- Summary statistics (total records, total CO2, average)
- Professional table styling with hover effects

---

### 4. Reports Tab (The "Compliance") 📑
**Route:** `/dashboard/reports`  
**Component:** `ReportsTab.tsx`  
**Module Connection:** Reporting & Exporting Module

**Logic Flow:**
```
User clicks "Reports" in sidebar
  ↓
Shows 2 export options:
  
OPTION 1: CSV Export (Ready Now)
  - User clicks "Download CSV"
  - Fetches from: /export-data/{business_id}
  - Backend normalizes data
  - Streams CSV response
  - Browser downloads file
  ↓
OPTION 2: PDF Export (Coming Phase 5)
  - Button disabled with "Coming Soon" label
  - Will use fpdf2 library
  - Professional branded template
```

**Features:**
- CSV export: ALL emissions with normalized dates/values
- PDF export: Coming soon (Phase 5 enhancement)
- Available reports list (Full, Monthly, Compliance, YoY)
- Compliance standards info (ISO 14064-1, GHG Protocol, etc.)
- Loading state with animated spinner
- Success/error feedback alerts
- Extracts filename from server response
- Automatic browser download

---

### 5. Settings Tab (The "Control") ⚙️
**Route:** `/dashboard/settings`  
**Component:** `SettingsTab.tsx`  
**Module Connection:** Business Profile Module

**Logic Flow:**
```
User clicks "Settings" in sidebar
  ↓
Shows 3 tabs (Profile, Security, Danger)
  
PROFILE TAB:
  - Edit business name and email
  - Account status indicator
  - Member since date
  - Plan information
  
SECURITY TAB:
  - Change password button
  - Active sessions display
  - 2FA toggle (coming Phase 6)
  
DANGER ZONE:
  - Download account data
  - Delete account (with confirmation)
```

**Features:**
- Tabbed interface (Profile, Security, Danger Zone)
- Editable business profile
- Account status display
- Session management view
- Danger zone for destructive actions
- Confirmation dialogs for permanent actions
- Uses PUT/DELETE requests (future backend integration)

---

## Sidebar Navigation Features

### Route-Based Active States
```tsx
<NavItem 
  active={location.pathname === "/dashboard/analytics"}
  onClick={() => navigate("/dashboard/analytics")}
/>
```

- Current tab is highlighted in green color
- Icon + label shown (or just icon when collapsed)
- Smooth animations on hover

### Responsive Design
- **Mobile:** Full-width drawer with overlay backdrop
- **Desktop:** Always visible sidebar on left
- **Collapsible:** Desktop sidebar can be toggled narrow (icons only)

### Protected Routes
```tsx
useEffect(() => {
  if (!businessId || businessId === "undefined") {
    navigate("/login");
  }
}, [businessId, navigate]);
```

- Sidebar only renders if user is logged in
- Redirects to login if session expires
- Business ID checked on mount

### Logout Button
- Located in sidebar footer
- Clears localStorage
- Redirects to login page
- Different styling on desktop vs mobile

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│           FRONTEND REACT COMPONENTS                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  DashboardLayout (Persistent Sidebar)                    │
│  ├── Sidebar Navigation (Route-based active states)      │
│  │   ├── Dashboard          → /dashboard                 │
│  │   ├── Analytics          → /dashboard/analytics       │
│  │   ├── Emissions Log      → /dashboard/emissions       │
│  │   ├── Reports            → /dashboard/reports         │
│  │   ├── Settings           → /dashboard/settings        │
│  │   └── [More tabs]        → /dashboard/[module]        │
│  │                                                        │
│  └── Main Content Area (Outlet)                          │
│      ├── DashboardOverview   (Charts + Stats)            │
│      ├── AnalyticsTab        (Advanced charts)           │
│      ├── EmissionsLogTab     (Searchable table)          │
│      ├── ReportsTab          (CSV/PDF exports)           │
│      └── SettingsTab         (Profile management)        │
│                                                           │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP Fetch
┌─────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (PORT 8001)                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  CALCULATION ENGINE:                                     │
│  └── /dashboard-stats/{business_id}                      │
│      ├── Total CO2 (sum of all co2_impact)              │
│      ├── Total kWh (sum where type=Electricity)          │
│      ├── Total Gas (sum where type=Natural Gas)          │
│      └── Log count (count of records)                    │
│                                                           │
│  DATA LOGGING MODULE:                                    │
│  ├── /recent-logs/{business_id}         (Last 5 logs)   │
│  └── /add-emission                      (POST new)      │
│                                                           │
│  VISUAL ANALYTICS MODULE:                                │
│  ├── /category-breakdown/{business_id}  (Group by type) │
│  └── /monthly-trends/{business_id}      (Group by month)│
│                                                           │
│  REPORTING & EXPORTING MODULE:                           │
│  ├── /export-data/{business_id}         (CSV stream)    │
│  └── [PDF export - Phase 5]              (Coming soon)  │
│                                                           │
│  BUSINESS PROFILE MODULE (Phase 6):                      │
│  ├── PUT /user/{business_id}             (Update profile)│
│  └── DELETE /user/{business_id}          (Delete account)│
│                                                           │
└─────────────────────────────────────────────────────────┘
                           ↓ Database Query
┌─────────────────────────────────────────────────────────┐
│              MYSQL DATABASE                              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Table: users                                            │
│  ├── id (business_id)                                    │
│  ├── business_name                                       │
│  ├── email                                               │
│  └── password                                            │
│                                                           │
│  Table: emissions                                        │
│  ├── id                                                  │
│  ├── business_id (FK)                                    │
│  ├── type (Electricity, Natural Gas, Fuel, Waste)       │
│  ├── value (usage amount)                                │
│  ├── unit (kWh, m³, kg, etc)                            │
│  ├── co2_impact (calculated)                             │
│  ├── recorded_at (timestamp)                             │
│  └── created_at (timestamp)                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## State Management

### Global State (localStorage)
```javascript
localStorage.getItem("user_id")        // business_id (required)
localStorage.getItem("business_name")  // company name
localStorage.getItem("email")          // user email
```

### Component State
```typescript
const [isSidebarOpen, setIsSidebarOpen] = useState(false);        // Mobile drawer
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse
const location = useLocation();                                     // Active route
```

### Tab-Level State
- **DashboardOverview:** stats, logs, categoryData, monthlyData, charts loading
- **AnalyticsTab:** categoryData, monthlyData, charts loading
- **EmissionsLogTab:** emissions, filteredEmissions, search term, type filter
- **ReportsTab:** download status, download progress
- **SettingsTab:** edit mode, active tab, delete confirmation

---

## Navigation Workflow

### User Logs In
```
User enters credentials
  ↓
API validates in /login endpoint
  ↓
Backend returns user_id + business_name
  ↓
Frontend stores in localStorage
  ↓
User redirected to /dashboard
  ↓
DashboardLayout mounts
  ↓
Protected route check passes (businessId exists)
  ↓
Sidebar renders with active Dashboard tab
  ↓
DashboardOverview fetches and displays data
```

### User Navigates Between Tabs
```
User clicks "Analytics" in sidebar
  ↓
React Router updates URL to /dashboard/analytics
  ↓
location.pathname changes
  ↓
NavItem re-renders with active={true} for Analytics
  ↓
Sidebar highlights Analytics in green color
  ↓
<Outlet /> renders AnalyticsTab component
  ↓
AnalyticsTab mounts
  ↓
useEffect fetches chart data
  ↓
Charts render with fresh data
```

### User Logs Out
```
User clicks "Logout" in sidebar footer
  ↓
localStorage.clear() removes all session data
  ↓
navigate("/login") redirects to auth
  ↓
Next time they return, they must log in again
```

---

## Future Tabs (Placeholders)

### Goals & Targets Tab (Phase 6)
- Set sustainability targets
- Track progress vs goals
- Visual progress indicators
- Goal management interface

### Help & Support Tab (Phase 6)
- FAQ section
- Contact form
- Documentation links
- Chat support (future)

---

## Key Implementation Details

### 1. Protected Routes
- Check `businessId` from localStorage
- Redirect to `/login` if missing
- Prevent unauthorized access

### 2. Active Tab Highlighting
- Use `location.pathname` from React Router
- Compare with route path in NavItem
- green background + color for active state

### 3. Responsive Design
- Tailwind breakpoints: sm, md, lg
- Sidebar: Fixed drawer on mobile, static on desktop
- Content: Full width, adjusts with sidebar

### 4. Data Fetching
- Each tab fetches on mount and periodically
- Uses localStorage to identify user
- Error handling with try-catch
- Loading states with spinners

### 5. Navigation
- `useNavigate()` hook for programmatic routing
- `useLocation()` hook for current route
- `<Outlet />` renders matched child routes

---

## Performance Optimizations

✅ **Lazy Loading:** Tabs only fetch data when mounted  
✅ **Real-time Refresh:** 10-second intervals for live data  
✅ **State Isolation:** Each tab manages its own state  
✅ **Responsive Images:** Icons scale with viewport  
✅ **CSS Animation:** Smooth transitions on state changes  
✅ **Memoization:** Components wrapped in React.memo (optional)  

---

## Summary

Your Verdustry application now has a **professional, scalable architecture** with:

1. ✅ Persistent sidebar navigation
2. ✅ Route-based tab switching
3. ✅ Protected routes (authentication check)
4. ✅ 5 functional tabs + 2 placeholder tabs
5. ✅ Active state highlighting
6. ✅ Mobile/desktop responsive design
7. ✅ Collapsible sidebar
8. ✅ Backend module connectivity

**Next steps:**
- Phase 6: Build Goals & Support tabs
- Phase 7: Implement Business Profile API endpoints
- Phase 8: Advanced analytics and recommendations
