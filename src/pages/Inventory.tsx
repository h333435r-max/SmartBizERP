import { useState } from "react";
import { getProducts, saveProducts, formatCurrency, getExpiryStatus, type Product } from "@/lib/data";
import { Package, AlertTriangle, TrendingDown, Search, Edit2, Check, X, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const EXPIRY_BADGE: Record<string, { label: string; cls: string; rowCls: string }> = {
  expired: { label: "Expired", cls: "bg-red-100 text-red-700", rowCls: "bg-red-50/40" },
  soon: { label: "Expiring Soon", cls: "bg-orange-100 text-orange-700", rowCls: "bg-orange-50/30" },
  ok: { label: "Fresh", cls: "bg-green-100 text-green-700", rowCls: "" },
  none: { label: "—", cls: "bg-gray-100 text-gray-400", rowCls: "" },
};

export default function Inventory() {
  const [products, setProducts] = useState(getProducts());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editId, setEditId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const getDaysToExpiry = (date: string) => {
    if (!date) return null;
    const exp = new Date(date); exp.setHours(0, 0, 0, 0);
    return Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filtered = products.filter((p) => {
    const m = p.name.toLowerCase().includes(search.toLowerCase());
    const expStatus = getExpiryStatus(p.expiryDate);
    if (filter === "Low") return m && p.stock <= p.minStock && p.stock > 0;
    if (filter === "Out") return m && p.stock <= 0;
    if (filter === "OK") return m && p.stock > p.minStock;
    if (filter === "Expiring") return m && (expStatus === "soon" || expStatus === "expired");
    return m;
  });

  const low = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const out = products.filter((p) => p.stock <= 0).length;
  const ok = products.filter((p) => p.stock > p.minStock).length;
  const expiring = products.filter((p) => {
    const s = getExpiryStatus(p.expiryDate);
    return s === "soon" || s === "expired";
  }).length;

  const startEdit = (p: Product) => { setEditId(p.id); setEditStock(p.stock); };
  const saveEdit = (id: string) => {
    const updated = products.map((p) => p.id === id ? { ...p, stock: editStock } : p);
    saveProducts(updated);
    setProducts(updated);
    setEditId(null);
    toast.success("Stock updated!");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-heading font-700 text-gray-900">Inventory</h2>
        <p className="text-gray-500 text-sm">Track and manage stock levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Products", value: products.length, color: "bg-navy-50 text-navy-700", icon: Package },
          { label: "In Stock", value: ok, color: "bg-green-50 text-green-700", icon: Check },
          { label: "Low Stock", value: low, color: "bg-orange-50 text-orange-600", icon: AlertTriangle },
          { label: "Out of Stock", value: out, color: "bg-red-50 text-red-600", icon: TrendingDown },
          { label: "Expiry Alert", value: expiring, color: "bg-rose-50 text-rose-600", icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-heading font-800 text-gray-900">{value}</div>
            <div className="text-gray-500 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Expiry Alert Banner */}
      {expiring > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-orange-800 font-semibold text-sm">{expiring} product{expiring > 1 ? "s" : ""} need expiry attention</div>
            <div className="text-orange-600 text-xs mt-0.5">
              {products.filter((p) => getExpiryStatus(p.expiryDate) === "expired").map(p => p.name).join(", ")} 
              {products.filter((p) => getExpiryStatus(p.expiryDate) === "expired").length > 0 && " — already expired. "}
              {products.filter((p) => getExpiryStatus(p.expiryDate) === "soon").map(p => `${p.name} (expires ${p.expiryDate})`).join(", ")}
              {products.filter((p) => getExpiryStatus(p.expiryDate) === "soon").length > 0 && " — expiring within 30 days."}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "All", label: "All" },
            { key: "OK", label: "In Stock" },
            { key: "Low", label: "Low Stock" },
            { key: "Out", label: "Out of Stock" },
            { key: "Expiring", label: `Expiry Alert${expiring > 0 ? ` (${expiring})` : ""}` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${filter === key ? "gradient-teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Product", "SKU", "Category", "Buy Price", "Sell Price", "GST%", "Current Stock", "Min Stock", "Stock Value", "Expiry Date", "Status", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const stockValue = p.stock * p.buyPrice;
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock <= 0;
                const expStatus = getExpiryStatus(p.expiryDate);
                const eb = EXPIRY_BADGE[expStatus];
                const days = getDaysToExpiry(p.expiryDate);
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isOut ? "bg-red-50/30" : isLow ? "bg-orange-50/30" : eb.rowCls}`}>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{p.sku}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-navy-50 text-navy-600 rounded-lg text-xs font-medium">{p.category}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.buyPrice)}</td>
                    <td className="px-4 py-3 text-sm text-brand-600 font-semibold">{formatCurrency(p.sellPrice)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.taxRate > 0 ? `${p.taxRate}%` : "—"}</td>
                    <td className="px-4 py-3">
                      {editId === p.id ? (
                        <input type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} className="w-20 border border-brand-300 rounded-lg px-2 py-1 text-sm outline-none" autoFocus />
                      ) : (
                        <span className={`text-sm font-semibold ${isOut ? "text-red-600" : isLow ? "text-orange-600" : "text-gray-900"}`}>{p.stock} {p.unit}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.minStock}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{formatCurrency(stockValue)}</td>
                    <td className="px-4 py-3">
                      {p.expiryDate ? (
                        <div>
                          <div className="text-xs text-gray-600 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3" /> {p.expiryDate}
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold mt-1 inline-block ${eb.cls}`}>
                            {expStatus === "expired" ? "Expired!" : expStatus === "soon" ? `${days}d left` : eb.label}
                          </span>
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isOut ? <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Out of Stock</span>
                        : isLow ? <span className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold w-fit"><AlertTriangle className="w-3 h-3" />Low</span>
                        : <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">Healthy</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editId === p.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => saveEdit(p.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(p)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No products found</div>}
        </div>
      </div>
    </div>
  );
}
