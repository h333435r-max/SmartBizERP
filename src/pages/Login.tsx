import { useState } from "react";
import { login, register, type AuthUser, type UserRole } from "@/lib/auth";
import { Store, Eye, EyeOff, LogIn, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@smartbiz.pk", password: "admin123", color: "gradient-teal", desc: "Full access to all modules" },
  { role: "Manager", email: "manager@smartbiz.pk", password: "manager123", color: "gradient-blue", desc: "Access except Settings" },
  { role: "Staff", email: "staff@smartbiz.pk", password: "staff123", color: "gradient-purple", desc: "POS billing only" },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("admin");
  const [regBusiness, setRegBusiness] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = login(email, password);
      if (user) {
        toast.success(`Welcome, ${user.name}!`);
        onLogin(user);
      } else {
        toast.error("Invalid email or password");
      }
      setLoading(false);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) { toast.error("Full name is required"); return; }
    if (!regEmail.trim()) { toast.error("Email is required"); return; }
    if (regPassword !== regConfirm) { toast.error("Passwords do not match"); return; }
    if (regPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);
    setTimeout(() => {
      const result = register({ name: regName, email: regEmail, password: regPassword, role: regRole, businessName: regBusiness });
      if (result.success) {
        const user = login(regEmail, regPassword);
        if (user) {
          toast.success(`Account created! Welcome, ${user.name}!`);
          onLogin(user);
        }
      } else {
        toast.error(result.error || "Registration failed");
      }
      setLoading(false);
    }, 700);
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1628] via-[#0f1c34] to-[#0B1628] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Branding */}
        <div className="hidden lg:block text-white space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-teal flex items-center justify-center shadow-glow">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-heading font-700">SmartBiz ERP</div>
              <div className="text-brand-400 text-sm">Complete Business Suite</div>
            </div>
          </div>
          <h1 className="text-4xl font-heading font-700 leading-tight">
            Manage your <span className="text-brand-400">entire business</span> from one place
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            POS, Inventory, Sales, Purchases, Customers, Suppliers, Expenses, GST, and AI Reports — all in one powerful platform.
          </p>

          {/* Demo Accounts */}
          <div className="space-y-3 pt-4">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Demo Accounts (Click to fill)</p>
            {DEMO_ACCOUNTS.map((acc) => (
              <button key={acc.role} onClick={() => fillDemo(acc)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group">
                <div className={`w-9 h-9 ${acc.color} rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {acc.role[0]}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">{acc.role}</div>
                  <div className="text-slate-500 text-xs">{acc.desc}</div>
                </div>
                <div className="text-slate-600 text-xs group-hover:text-brand-400 transition-colors">Fill →</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl w-full">
          {/* Logo - mobile */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="font-heading font-700 text-gray-900">SmartBiz ERP</div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "signup" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </button>
          </div>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <>
              <h2 className="text-2xl font-heading font-700 text-gray-900 mb-1">Welcome back!</h2>
              <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required autoComplete="email"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" required autoComplete="current-password"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full gradient-teal text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <LogIn className="w-4 h-4" />}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {/* Mobile Demo */}
              <div className="mt-5 lg:hidden">
                <p className="text-gray-400 text-xs text-center mb-3">Quick Demo Login</p>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button key={acc.role} onClick={() => fillDemo(acc)} className={`${acc.color} text-white py-2 rounded-xl text-xs font-semibold hover:opacity-90`}>{acc.role}</button>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
                Demo: admin123 / manager123 / staff123
              </div>
            </>
          )}

          {/* SIGNUP FORM */}
          {mode === "signup" && (
            <>
              <h2 className="text-2xl font-heading font-700 text-gray-900 mb-1">Create Account</h2>
              <p className="text-gray-500 text-sm mb-5">Set up your SmartBiz ERP account</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name *</label>
                  <input
                    type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ahmad Ali" required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Business Name (optional)</label>
                  <input
                    type="text" value={regBusiness} onChange={(e) => setRegBusiness(e.target.value)}
                    placeholder="My Shop Name"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address *</label>
                  <input
                    type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Role *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["admin", "manager", "staff"] as UserRole[]).map((r) => (
                      <button key={r} type="button" onClick={() => setRegRole(r)} className={`py-2 rounded-xl text-xs font-semibold capitalize flex items-center justify-center gap-1 transition-all border-2 ${regRole === r ? "border-brand-400 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        <Shield className="w-3 h-3" /> {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {regRole === "admin" ? "Full access to all modules" : regRole === "manager" ? "Access to most modules" : "POS billing only"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password *</label>
                  <div className="relative">
                    <input
                      type={showRegPass ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 characters" required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                    <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm Password *</label>
                  <input
                    type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Re-enter password" required
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all ${regConfirm && regConfirm !== regPassword ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"}`}
                  />
                  {regConfirm && regConfirm !== regPassword && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
                </div>

                <button type="submit" disabled={loading} className="w-full gradient-teal text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <UserPlus className="w-4 h-4" />}
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-brand-600 font-semibold hover:underline">Sign In</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
