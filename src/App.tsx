import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import POS from "@/pages/POS";
import Products from "@/pages/Products";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import Purchases from "@/pages/Purchases";
import Customers from "@/pages/Customers";
import Suppliers from "@/pages/Suppliers";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import DailyReport from "@/pages/DailyReport";
import Settings from "@/pages/Settings";
import Credit from "@/pages/Credit";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { type AuthUser, type UserRole, getCurrentUser, hasAccess } from "@/lib/auth";

const queryClient = new QueryClient();

function ProtectedRoute({ user, path, children }: { user: AuthUser; path: string; children: React.ReactNode }) {
  if (!hasAccess(user.role, path)) {
    // Staff redirected to POS, others to dashboard
    return <Navigate to={user.role === "staff" ? "/pos" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

const App = () => {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <Login onLogin={(u) => setUser(u)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  const defaultPath = user.role === "staff" ? "/pos" : "/dashboard";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout user={user} onLogout={() => setUser(null)} />}>
              <Route index element={<Navigate to={defaultPath} replace />} />
              <Route path="dashboard" element={<ProtectedRoute user={user} path="/dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="pos" element={<ProtectedRoute user={user} path="/pos"><POS /></ProtectedRoute>} />
              <Route path="products" element={<ProtectedRoute user={user} path="/products"><Products /></ProtectedRoute>} />
              <Route path="inventory" element={<ProtectedRoute user={user} path="/inventory"><Inventory /></ProtectedRoute>} />
              <Route path="sales" element={<ProtectedRoute user={user} path="/sales"><Sales /></ProtectedRoute>} />
              <Route path="purchases" element={<ProtectedRoute user={user} path="/purchases"><Purchases /></ProtectedRoute>} />
              <Route path="customers" element={<ProtectedRoute user={user} path="/customers"><Customers /></ProtectedRoute>} />
              <Route path="suppliers" element={<ProtectedRoute user={user} path="/suppliers"><Suppliers /></ProtectedRoute>} />
              <Route path="expenses" element={<ProtectedRoute user={user} path="/expenses"><Expenses /></ProtectedRoute>} />
              <Route path="credit" element={<ProtectedRoute user={user} path="/credit"><Credit /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute user={user} path="/reports"><Reports /></ProtectedRoute>} />
              <Route path="daily-report" element={<ProtectedRoute user={user} path="/daily-report"><DailyReport /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute user={user} path="/settings"><Settings /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
