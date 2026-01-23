import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./features/auth/components/LoginForm";
import { RegistrationForm } from "./features/auth/components/RegisterCard";
import { DashboardLayout } from "./features/dashboard/components/DashboardLayout";
import { DashboardOverview } from "./features/dashboard/components/DashboardOverview";
import { AnalyticsTab } from "./features/dashboard/components/tabs/AnalyticsTab";
import { EmissionsLogTab } from "./features/dashboard/components/tabs/EmissionsLogTab";
import { ReportsTab } from "./features/dashboard/components/tabs/ReportsTab";
import { SettingsTab } from "./features/dashboard/components/tabs/SettingsTab";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="analytics" element={<AnalyticsTab />} />
          <Route path="emissions" element={<EmissionsLogTab />} />
          <Route path="reports" element={<ReportsTab />} />
          <Route path="settings" element={<SettingsTab />} />
          {/* Placeholder routes for future modules */}
          <Route path="goals" element={<div className="p-8"><h1 className="text-3xl font-black text-slate-900">Goals & Targets</h1><p className="text-slate-600 mt-2">Coming in Phase 6</p></div>} />
          <Route path="support" element={<div className="p-8"><h1 className="text-3xl font-black text-slate-900">Help & Support</h1><p className="text-slate-600 mt-2">Coming in Phase 6</p></div>} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;