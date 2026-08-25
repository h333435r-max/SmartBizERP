import { useState } from "react";
import { getProducts, saveProducts, generateId, formatCurrency, getExpiryStatus, type Product } from "@/lib/data";
import { Plus, Search, Edit2, Trash2, X, Package, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Grocery", "Medicine", "Mobile", "Electronics", "Garments", "Hardware", "Books", "Bakery", "Others"];
const UNITS = ["Piece", "Kg", "Gram", "Liter", "Bag", "Box", "Strip", "Dozen", "Meter", "Bottle"];

const EXPIRY_BADGE: Record<string, { label: string; cls: string }> = {
  expired: { label: "Expired", cls: "bg-red-100 text-red-700" },
  soon: { label: "Expiring Soon", cls: "bg-orange-100 text-orange-700" },
  ok: { label: "Fresh", cls: "bg-green-100 text-green-700" },
  none: { label: "N/A", cls: "bg-gray-100 text-gray-500" },
};

export default function Products() {
  const [products, setProducts] = useState(getProducts());
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  const categories = ["All", ...CATEGORIES];
  const filtered = products.filter((p) => {
    const m = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return m && (filterCat === "All" || p.category === filterCat);
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ category: "Grocery", unit: "Piece", minStock: 10, taxRate: 0, expiryDate: "" });
    setShowModal(true);
  };
  const openEdit = (p: Product) => { setEditProduct(p); setForm(p); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.sku || !form.sellPrice) { toast.error("Please fill all required fields"); return; }
    let updated: Product[];
    if (editProduct) {
      updated = products.map((p) => p.id === editProduct.id ? { ...p, ...form } as Product : p);
      toast.success("Product updated!");
    } else {
      const newProduct: Product = {
        id: generateId(), name: form.name!, sku: form.sku!, category: form.category || "Others",
        buyPrice: form.buyPrice || 0, sellPrice: form.sellPrice!, stock: form.stock || 0,
        minStock: form.minStock || 10, unit: form.unit || "Piece", barcode: form.barcode || "",
        taxRate: form.taxRate || 0, expiryDate: form.expiryDate || "",
      };
      updated = [...products, newProduct];
      toast.success("Product added!");
    }
    saveProducts(updated);
    setProducts(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    setProducts(updated);
    toast.success("Product deleted");
  };

  const expiringSoon = products.filter((p) => getExpiryStatus(p.expiryDate) === "soon" || getExpiryStatus(p.expiryDate) === "expired").length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-700 text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-2">
          {expiringSoon > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> {expiringSoon} Expiry Alert{expiringSoon > 1 ? "s" : ""}
            </span>
          )}
          <button onClick={openAdd} className="flex items-center gap-2 gradient-teal text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-glow">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-gray-100 border-0 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["SKU", "Name", "Category", "Buy", "Sell", "GST%", "Stock", "Expiry", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const expStatus = getExpiryStatus(p.expiryDate);
                const eb = EXPIRY_BADGE[expStatus];
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.unit}</div>
                    </td>
                    <td className="px-4 py-3"><span className="px-2.5 py-1 bg-navy-50 text-navy-700 rounded-lg text-xs font-medium">{p.category}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.buyPrice)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-600">{formatCurrency(p.sellPrice)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.taxRate > 0 ? `${p.taxRate}%` : "-"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{p.stock}</td>
                    <td className="px-4 py-3">
                      {p.expiryDate ? (
                        <div>
                          <div className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{p.expiryDate}</div>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold mt-0.5 inline-block ${eb.cls}`}>{eb.label}</span>
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {p.stock <= 0 ? (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Out of Stock</span>
                      ) : p.stock <= p.minStock ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold w-fit"><AlertTriangle className="w-3 h-3" /> Low</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">In Stock</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-700 text-gray-900">{editProduct ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product Name *</label>
                <input type="text" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition" />
              </div>
              {[
                { label: "SKU *", key: "sku", type: "text" },
                { label: "Barcode", key: "barcode", type: "text" },
                { label: "Buy Price (₨)", key: "buyPrice", type: "number" },
                { label: "Sell Price (₨) *", key: "sellPrice", type: "number" },
                { label: "Stock Qty", key: "stock", type: "number" },
                { label: "Min Stock Alert", key: "minStock", type: "number" },
                { label: "GST/Tax Rate (%)", key: "taxRate", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof Product] as string | number || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    placeholder={key === "taxRate" ? "0 = use global rate" : ""}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate || ""}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
                />
                <p className="text-xs text-gray-400 mt-1">For Medicine, Grocery, Food items</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                <select value={form.category || "Grocery"} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Unit</label>
                <select value={form.unit || "Piece"} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400">
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2.5 gradient-teal text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-glow">
                {editProduct ? "Update" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
