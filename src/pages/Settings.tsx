import { useState } from "react";
import { toast } from "sonner";
import { Save, Store, User, Bell, Shield, Palette, Database, Percent } from "lucide-react";
import { getSettings, saveSettings, type ShopSettings } from "@/lib/data";

const TABS = [
  { id: "business", label: "Business Info", icon: Store },
  { id: "tax", label: "Tax & GST", icon: Percent },
  { id: "user", label: "User & Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "data", label: "Data & Backup", icon: Database },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");
  const [settings, setSettings] = useState<ShopSettings>(getSettings());
  const [notifSettings, setNotifSettings] = useState({
    lowStock: true, dailyReport: true, saleAlert: false, expenseAlert: true,
  });

  const handleSave = () => {
    saveSettings(settings);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-heading font-700 text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm">Manage your ERP configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${activeTab === id ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <Icon className={`w-4 h-4 ${activeTab === id ? "text-brand-500" : "text-gray-400"}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          {/* BUSINESS INFO */}
          {activeTab === "business" && (
            <div>
              <h3 className="font-heading font-700 text-gray-900 text-lg mb-5">Business Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Business Name", key: "name", type: "text" },
                  { label: "Tagline", key: "tagline", type: "text" },
                  { label: "Phone Number", key: "phone", type: "tel" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "NTN / Tax No.", key: "taxNo", type: "text" },
                  { label: "Invoice Prefix", key: "invoicePrefix", type: "text" },
                  { label: "Currency", key: "currency", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
                    <input
                      type={type}
                      value={settings[key as keyof ShopSettings] as string}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Address</label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAX & GST */}
          {activeTab === "tax" && (
            <div>
              <h3 className="font-heading font-700 text-gray-900 text-lg mb-2">Tax & GST Configuration</h3>
              <p className="text-gray-500 text-sm mb-5">Set global tax rate applied when product has no individual tax rate.</p>
              <div className="space-y-4">
                <div className="p-5 bg-brand-50 rounded-2xl border border-brand-100">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Global GST / Tax Rate (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min={0} max={100}
                      value={settings.globalTaxRate}
                      onChange={(e) => setSettings((s) => ({ ...s, globalTaxRate: Number(e.target.value) }))}
                      className="w-32 border-2 border-brand-200 rounded-xl px-3 py-2.5 text-lg font-bold outline-none focus:border-brand-400 text-center"
                    />
                    <span className="text-2xl font-bold text-gray-400">%</span>
                    <span className="text-sm text-gray-500">applied to all taxable items</span>
                  </div>
                  <p className="text-xs text-brand-600 mt-2">Per-product tax rate (set in Products page) overrides this global rate.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 5, 8, 10, 13, 17, 18].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSettings((s) => ({ ...s, globalTaxRate: rate }))}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${settings.globalTaxRate === rate ? "border-brand-400 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    >
                      {rate === 0 ? "No Tax (0%)" : `GST ${rate}%`}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="text-sm font-semibold text-yellow-800 mb-1">How GST Works in POS</div>
                  <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                    <li>If a product has its own tax rate set (in Products page), that rate is used</li>
                    <li>If product tax rate is 0, the global rate above is applied</li>
                    <li>Tax is shown as a separate line in invoice (Subtotal + Tax = Total)</li>
                    <li>Set 0% global rate to disable tax for all products</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div>
              <h3 className="font-heading font-700 text-gray-900 text-lg mb-5">Notification Settings</h3>
              <div className="space-y-4">
                {[
                  { key: "lowStock", label: "Low Stock Alert", desc: "Get notified when products go below minimum stock level" },
                  { key: "dailyReport", label: "Daily Report", desc: "Receive daily business summary report" },
                  { key: "saleAlert", label: "Sale Notifications", desc: "Get notified for every new sale" },
                  { key: "expenseAlert", label: "Expense Alert", desc: "Get notified when new expenses are added" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{label}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifSettings((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifSettings[key as keyof typeof notifSettings] ? "bg-brand-500" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifSettings[key as keyof typeof notifSettings] ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <div>
              <h3 className="font-heading font-700 text-gray-900 text-lg mb-5">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-3 block">Theme Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {["#14b896", "#3362ef", "#f97316", "#8b5cf6", "#f43f5e", "#06b6d4"].map((color) => (
                      <button key={color} className="w-10 h-10 rounded-xl border-2 border-white shadow hover:scale-110 transition-transform" style={{ background: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div>
              <h3 className="font-heading font-700 text-gray-900 text-lg mb-5">Security Settings</h3>
              <div className="space-y-4">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Current Password</label><input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">New Password</label><input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm Password</label><input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" /></div>
              </div>
            </div>
          )}

          {/* DATA */}
          {activeTab === "data" && (
            <div>
              <h3 className="font-heading font-700 text-gray-900 text-lg mb-5">Data Management</h3>
              <div className="space-y-3">
                {[
                  { label: "Export All Data (JSON)", desc: "Download complete backup of all business data", color: "gradient-teal", action: () => { const data = { sales: JSON.parse(localStorage.getItem("erp_sales") || "[]"), products: JSON.parse(localStorage.getItem("erp_products") || "[]") }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `smartbiz-backup-${Date.now()}.json`; a.click(); toast.success("Backup downloaded!"); } },
                  { label: "Clear All Sales Data", desc: "Remove all sales records (cannot be undone)", color: "gradient-rose", action: () => { if (confirm("Are you sure? This will delete all sales data!")) { localStorage.removeItem("erp_sales"); toast.success("Sales data cleared"); } } },
                  { label: "Reset to Sample Data", desc: "Restore original demo data", color: "gradient-orange", action: () => { if (confirm("Reset all data to sample/demo data?")) { localStorage.clear(); toast.success("Data reset! Refresh the page."); } } },
                ].map(({ label, desc, color, action }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div><div className="font-semibold text-gray-900 text-sm">{label}</div><div className="text-gray-500 text-xs mt-0.5">{desc}</div></div>
                    <button onClick={action} className={`${color} text-white px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity`}>Run</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USER */}
          {activeTab === "user" && (
            <div>
              <h3 className="font-heading font-700 text-gray-900 text-lg mb-5">User Account</h3>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 gradient-teal rounded-2xl flex items-center justify-center text-white font-bold text-2xl">A</div>
                <div>
                  <div className="font-semibold text-gray-900">Admin User</div>
                  <div className="text-gray-500 text-sm">admin@smartbiz.pk</div>
                  <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-lg text-xs font-semibold">Owner / Super Admin</span>
                </div>
              </div>
              <div className="space-y-4">
                {[{ label: "Full Name", value: "Admin User" }, { label: "Email", value: "admin@smartbiz.pk" }, { label: "Phone", value: "03001234567" }].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
                    <input defaultValue={value} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button onClick={handleSave} className="flex items-center gap-2 gradient-teal text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-glow">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
