import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, TrendingUp,
  ShoppingBag, Users, Truck, DollarSign, BarChart3, Settings,
  Bell, Menu, X, ChevronRight, Store, AlertTriangle, CreditCard,
  LogOut, Shield, User, FileText
} from "lucide-react";
import { getProducts } from "@/lib/data";
import { type AuthUser, type UserRole, hasAccess, logout, ROLE_PERMISSIONS } from "@/lib/auth";

interface AppLayoutProps {
  user: AuthUser;
  onLogout: () => void;
}

const allNavItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "text-brand-400" },
  { path: "/pos", icon: ShoppingCart, label: "POS / Billing", color: "text-yellow-400" },
  { path: "/products", icon: Package, label: "Products", color: "text-blue-400" },
  { path: "/inventory", icon: Warehouse, label: "Inventory", color: "text-purple-400" },
  { path: "/sales", icon: TrendingUp, label: "Sales", color: "text-green-400" },
  { path: "/purchases", icon: ShoppingBag, label: "Purchases", color: "text-orange-400" },
  { path: "/customers", icon: Users, label: "Customers", color: "text-pink-400" },
  { path: "/suppliers", icon: Truck, label: "Suppliers", color: "text-cyan-400" },
  { path: "/expenses", icon: DollarSign, label: "Expenses", color: "text-red-400" },
  { path: "/credit", icon: CreditCard, label: "Credit (Udhar)", color: "text-rose-400" },
  { path: "/daily-report", icon: FileText, label: "Daily Report", color: "text-amber-400" },
  { path: "/reports", icon: BarChart3, label: "Reports", color: "text-indigo-400" },
  { path: "/settings", icon: Settings, label: "Settings", color: "text-gray-400" },
];

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  admin: "bg-brand-500",
  manager: "bg-navy-500",
  staff: "bg-purple-500",
};

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const products = getProducts();
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // Filter nav items based on role
  const navItems = allNavItems.filter((item) => hasAccess(user.role, item.path));
  const currentPage = allNavItems.find((n) => n.path === location.pathname)?.label || "SmartBiz ERP";

  const handleLogout = () => {
    logout();
    onLogout();
    navigate("/");
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${!sidebarOpen && !mobile ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center flex-shrink-0 shadow-glow">
          <Store className="w-5 h-5 text-white" />
        </div>
        {(sidebarOpen || mobile) && (
          <div className="flex-1 min-w-0">
            <div className="text-white font-heading font-700 text-sm leading-tight">SmartBiz ERP</div>
            <div className="text-brand-400 text-xs">Business Suite</div>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Badge */}
      {(sidebarOpen || mobile) && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 ${ROLE_BADGE_COLORS[user.role]} rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
              {user.avatar}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user.name}</div>
              <div className="text-slate-500 text-xs capitalize flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />{user.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => mobile && setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive ? "bg-sidebar-active text-white" : "text-slate-400 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? item.color : ""}`} />
              {(sidebarOpen || mobile) && (
                <>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-brand-400" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Low Stock Alert */}
      {(sidebarOpen || mobile) && lowStockCount > 0 && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <div>
              <div className="text-orange-400 text-xs font-semibold">{lowStockCount} Low Stock</div>
              <div className="text-slate-500 text-xs">Items need reorder</div>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      {(sidebarOpen || mobile) && (
        <button
          onClick={handleLogout}
          className="mx-3 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      )}

      {/* Toggle (desktop only) */}
      {!mobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mx-3 mb-4 p-2 rounded-xl bg-sidebar-hover text-slate-400 hover:text-white transition-colors flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-64 bg-sidebar flex flex-col h-full z-10 animate-slide-in">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-gray-900 font-heading font-700 text-lg leading-tight">{currentPage}</h1>
            <p className="text-gray-500 text-xs">Tuesday, 25 August 2026</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {lowStockCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl p-1.5 transition-colors">
                <div className={`w-9 h-9 ${ROLE_BADGE_COLORS[user.role]} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                  {user.avatar}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-gray-900 text-sm font-semibold">{user.name}</div>
                  <div className="text-gray-500 text-xs capitalize">{user.role}</div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-xs text-white font-semibold ${ROLE_BADGE_COLORS[user.role]}`}>
                      <Shield className="w-2.5 h-2.5" /> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <div className="px-2 py-1">
                    <div className="text-xs text-gray-400 px-2 py-1 font-semibold uppercase tracking-wide">Access Level</div>
                    <div className="px-2 pb-2 space-y-0.5">
                      {ROLE_PERMISSIONS[user.role].map((p) => (
                        <div key={p} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span>
                          {allNavItems.find((n) => n.path === p)?.label || p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 px-2 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" onClick={() => showUserMenu && setShowUserMenu(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
