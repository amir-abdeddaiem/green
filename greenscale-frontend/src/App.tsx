import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./features/auth/components/LoginForm";
import { RegistrationForm } from "./features/auth/components/RegisterCard";
import { DashboardLayout } from "./features/dashboard/components/DashboardLayout";
import { DashboardOverview } from "./features/dashboard/components/DashboardOverview";
import { AnalyticsTab } from "./features/dashboard/components/tabs/AnalyticsTab";
import { EmissionsLogTab } from "./features/dashboard/components/tabs/EmissionsLogTab";
import { ReportsTab } from "./features/dashboard/components/tabs/ReportsTab";
import { SettingsTab } from "./features/dashboard/components/tabs/SettingsTab";
import { GoalsTab } from "./features/dashboard/components/tabs/GoalsTab";
import { SupportTab } from "./features/dashboard/components/tabs/SupportTab";
import { FinancialTab } from "./features/dashboard/components/tabs/FinancialTab";
import { BillingTariffsTab } from "./features/dashboard/components/tabs/BillingTariffsTab";
import { ROICalculator } from "./features/dashboard/components/tabs/ROICalculator";
import { Scope3Tab } from "./features/dashboard/components/tabs/Scope3Tab";
import { SuperAdminDashboard } from "./features/dashboard/components/SuperAdminDashboard";
import { SuperAdminLayout } from "./features/dashboard/components/SuperAdminLayout";
import { AdminUsersPage } from "./features/dashboard/components/pages/AdminUsersPage";
import { AdminSettingsPage } from "./features/dashboard/components/pages/AdminSettingsPage";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { HomePage } from "./pages/HomePage";
import { DocumentScannerTab } from "./features/dashboard/components/tabs/DocsTab";
import { DatabaseIntegrationTab } from "./features/dashboard/components/tabs/IntegrationTab";
import { BookDemo } from "./pages/home/BookDemo";
import CbamPage from "./pages/home/Cbam";
import CsrdPage from "./pages/home/Csrd";


function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />
        <Route path="/book-demo" element={<BookDemo />} />
        <Route path="/cbam" element={<CbamPage />} />
        <Route path="/csrd" element={<CsrdPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />

        {/* Super Admin Dashboard Routes (PROTECTED - Owner Only) */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedAdminRoute>
              <SuperAdminLayout>
                <SuperAdminDashboard />
              </SuperAdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-dashboard/users"
          element={
            <ProtectedAdminRoute>
              <SuperAdminLayout>
                <AdminUsersPage />
              </SuperAdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-dashboard/settings"
          element={
            <ProtectedAdminRoute>
              <SuperAdminLayout>
                <AdminSettingsPage />
              </SuperAdminLayout>
            </ProtectedAdminRoute>
          }
        />

        {/* Regular User Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="docs" element={<DocumentScannerTab />} />
          <Route path="integration" element={<DatabaseIntegrationTab />} />
          {/* 
          
          <Route path="rapport" element={<AnalyticsTab />} /> */}
          <Route path="analytics" element={<AnalyticsTab />} />
          <Route path="emissions" element={<EmissionsLogTab />} />
          <Route path="reports" element={<ReportsTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route path="goals" element={<GoalsTab />} />
          <Route path="support" element={<SupportTab />} />
          <Route path="financial" element={<FinancialTab />} />
          <Route path="roi" element={<ROICalculator />} />
          <Route path="billing" element={<BillingTariffsTab />} />
          <Route path="scope3" element={<Scope3Tab />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;