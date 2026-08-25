import { useState } from "react";
import { getPurchases, getSuppliers, getProducts, savePurchases, saveProducts, generateId, formatCurrency, formatDate, type Purchase, type PurchaseItem } from "@/lib/data";
import { Search, Plus, Eye, X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function Purchases() {
  const [purchases, setPurchases] = useState(getPurchases());
  const [suppliers] = useState(getSuppliers());
  const [products] = useState(getProducts());
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [form, setForm] = useState({ supplierId: "", paid: 0 });
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const filtered = purchases.filter((p) =>
    p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => setItems((prev) => [...prev, { productId: "", productName: "", qty: 1, price: 0 }]);
  const updateItem = (idx: number, key: keyof PurchaseItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      if (key === "productId") {
        const p = products.find((pr) => pr.id === value);
        return p ? { ...item, productId: p.id, productName: p.name, price: p.buyPrice } : item;
      }
      return { ...item, [key]: value };
    }));
  };
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  const handleSave = () => {
    if (!form.supplierId || items.length === 0) { toast.error("Select supplier and add items"); return; }
    const supplier = suppliers.find((s) => s.id === form.supplierId)!;
    const invoiceNo = `PUR-2026-${String(purchases.length + 1).padStart(3, "0")}`;
    const newPurchase: Purchase = {
      id: generateId(), invoiceNo, supplierId: form.supplierId, supplierName: supplier.name,
      items, subtotal, tax: 0, total: subtotal, paid: form.paid,
      date: new Date().toISOString().split("T")[0],
      status: form.paid >= subtotal ? "paid" : form.paid > 0 ? "partial" : "pending",
    };
    const updatedPurchases = [...purchases, newPurchase];
    savePurchases(updatedPurchases);
    setPurchases(updatedPurchases);

    // Update stock
    const allProducts = getProducts();
    const updatedProducts = allProducts.map((p) => {
      const purchaseItem = items.find((i) => i.productId === p.id);
      return purchaseItem ? { ...p, stock: p.stock + purchaseItem.qty } : p;
    });
    saveProducts(updatedProducts);

    toast.success(`Purchase recorded: ${invoiceNo}`);
    setShowModal(false);
    setItems([]);
    setForm({ supplierId: "", paid: 0 });
  };

  const totalPurchases = purchases.reduce((s, p) => s + p.total, 0);
  const totalPaid = purchases.reduce((s, p) => s + p.paid, 0);
  const totalPending = purchases.reduce((s, p) => s + (p.total - p.paid), 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-700 text-gray-900">Purchases</h2>
          <p className="text-gray-500 text-sm">{purchases.length} total purchases</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 gradient-teal text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-glow">
          <Plus className="w-4 h-4" /> New Purchase
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Purchased", value: formatCurrency(totalPurchases), color: "gradient-blue" },
          { label: "Total Paid", value: formatCurrency(totalPaid), color: "gradient-teal" },
          { label: "Pending", value: formatCurrency(totalPending), color: "gradient-orange" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-heading font-800 text-gray-900">{value}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search purchases..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Invoice", "Supplier", "Date", "Total", "Paid", "Balance", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-navy-600">{p.invoiceNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(p.total)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">{formatCurrency(p.paid)}</td>
                  <td className="px-4 py-3 text-sm text-red-500 font-semibold">{formatCurrency(p.total - p.paid)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${p.status === "paid" ? "bg-green-50 text-green-700" : p.status === "partial" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewPurchase(p)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No purchases found</div>}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-700 text-gray-900">New Purchase</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Supplier *</label>
                <select value={form.supplierId} onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400">
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Items</label>
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-700">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400">
                          <option value="">Select Product</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" value={item.qty} onChange={(e) => updateItem(idx, "qty", Number(e.target.value))} placeholder="Qty" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" value={item.price} onChange={(e) => updateItem(idx, "price", Number(e.target.value))} placeholder="Price" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                      </div>
                      <div className="col-span-1 text-xs text-gray-700 font-semibold">{formatCurrency(item.qty * item.price)}</div>
                      <div className="col-span-1">
                        <button onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-xl">Click "Add Item" to begin</div>}
                </div>
              </div>

              <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(subtotal)}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount Paid (₨)</label>
                <input type="number" value={form.paid} onChange={(e) => setForm((f) => ({ ...f, paid: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2.5 gradient-teal text-white rounded-xl font-semibold text-sm hover:opacity-90">Save Purchase</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-700 text-gray-900">{viewPurchase.invoiceNo}</h3>
              <button onClick={() => setViewPurchase(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Supplier:</span>
                <span className="font-semibold text-gray-900">{viewPurchase.supplierName}</span>
              </div>
              <table className="w-full mb-4">
                <thead><tr className="text-xs text-gray-400 uppercase"><th className="text-left pb-2">Item</th><th className="text-right pb-2">Qty</th><th className="text-right pb-2">Price</th><th className="text-right pb-2">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {viewPurchase.items.map((item, i) => (
                    <tr key={i} className="text-sm">
                      <td className="py-1.5 text-gray-700">{item.productName}</td>
                      <td className="py-1.5 text-right text-gray-500">{item.qty}</td>
                      <td className="py-1.5 text-right text-gray-500">{formatCurrency(item.price)}</td>
                      <td className="py-1.5 text-right font-semibold">{formatCurrency(item.qty * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between font-700 text-base text-gray-900"><span>Total</span><span className="text-brand-600">{formatCurrency(viewPurchase.total)}</span></div>
                <div className="flex justify-between text-green-600 font-semibold"><span>Paid</span><span>{formatCurrency(viewPurchase.paid)}</span></div>
                {viewPurchase.total - viewPurchase.paid > 0 && <div className="flex justify-between text-red-500 font-semibold"><span>Balance</span><span>{formatCurrency(viewPurchase.total - viewPurchase.paid)}</span></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
