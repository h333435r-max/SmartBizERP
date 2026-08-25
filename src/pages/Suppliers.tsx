import { useState } from "react";
import { getSuppliers, saveSuppliers, generateId, formatCurrency, type Supplier } from "@/lib/data";
import { Plus, Search, Edit2, Trash2, X, Truck, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(getSuppliers());
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  );

  const totalOutstanding = suppliers.reduce((s, x) => s + x.outstanding, 0);
  const totalBusiness = suppliers.reduce((s, x) => s + x.totalPurchases, 0);

  const openAdd = () => { setEditSupplier(null); setForm({ outstanding: 0, totalPurchases: 0 }); setShowModal(true); };
  const openEdit = (s: Supplier) => { setEditSupplier(s); setForm(s); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) { toast.error("Name and phone are required"); return; }
    let updated: Supplier[];
    if (editSupplier) {
      updated = suppliers.map((s) => s.id === editSupplier.id ? { ...s, ...form } as Supplier : s);
      toast.success("Supplier updated!");
    } else {
      const newS: Supplier = {
        id: generateId(), name: form.name!, phone: form.phone!, email: form.email || "",
        address: form.address || "", outstanding: 0, totalPurchases: 0,
        joinDate: new Date().toISOString().split("T")[0],
      };
      updated = [...suppliers, newS];
      toast.success("Supplier added!");
    }
    saveSuppliers(updated);
    setSuppliers(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = suppliers.filter((s) => s.id !== id);
    saveSuppliers(updated);
    setSuppliers(updated);
    toast.success("Supplier deleted");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-700 text-gray-900">Suppliers</h2>
          <p className="text-gray-500 text-sm">{suppliers.length} registered suppliers</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 gradient-teal text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-glow">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-teal rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
          <div><div className="text-xl font-heading font-800 text-gray-900">{suppliers.length}</div><div className="text-gray-500 text-sm">Total Suppliers</div></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
          <div><div className="text-xl font-heading font-800 text-gray-900">{formatCurrency(totalBusiness)}</div><div className="text-gray-500 text-sm">Total Purchases</div></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
          <div><div className="text-xl font-heading font-800 text-orange-600">{formatCurrency(totalOutstanding)}</div><div className="text-gray-500 text-sm">Payable</div></div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                  <div className="text-gray-400 text-xs">Since {s.joinDate}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" />{s.phone}</div>
              {s.email && <div className="flex items-center gap-2 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{s.email}</div>}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(s.totalPurchases)}</div>
                <div className="text-xs text-gray-400">Total Purchased</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-semibold ${s.outstanding > 0 ? "text-orange-500" : "text-green-600"}`}>{formatCurrency(s.outstanding)}</div>
                <div className="text-xs text-gray-400">Payable</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card border border-gray-100">
          <Truck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-400 text-sm">No suppliers found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-700 text-gray-900">{editSupplier ? "Edit Supplier" : "Add Supplier"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Company Name *", key: "name", type: "text" },
                { label: "Phone *", key: "phone", type: "tel" },
                { label: "Email", key: "email", type: "email" },
                { label: "Address", key: "address", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof Supplier] as string || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2.5 gradient-teal text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-glow">
                {editSupplier ? "Update" : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
