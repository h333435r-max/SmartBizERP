import { useState } from "react";
import { getCustomers, saveCustomers, generateId, formatCurrency, type Customer } from "@/lib/data";
import { Plus, Search, Edit2, Trash2, X, Users, Phone, Mail, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const [customers, setCustomers] = useState(getCustomers());
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);
  const totalBusiness = customers.reduce((s, c) => s + c.totalPurchases, 0);

  const openAdd = () => { setEditCustomer(null); setForm({ creditLimit: 5000, outstanding: 0, totalPurchases: 0 }); setShowModal(true); };
  const openEdit = (c: Customer) => { setEditCustomer(c); setForm(c); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) { toast.error("Name and phone are required"); return; }
    let updated: Customer[];
    if (editCustomer) {
      updated = customers.map((c) => c.id === editCustomer.id ? { ...c, ...form } as Customer : c);
      toast.success("Customer updated!");
    } else {
      const newC: Customer = {
        id: generateId(), name: form.name!, phone: form.phone!, email: form.email || "",
        address: form.address || "", creditLimit: form.creditLimit || 0, outstanding: 0,
        totalPurchases: 0, joinDate: new Date().toISOString().split("T")[0],
      };
      updated = [...customers, newC];
      toast.success("Customer added!");
    }
    saveCustomers(updated);
    setCustomers(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    saveCustomers(updated);
    setCustomers(updated);
    toast.success("Customer deleted");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-700 text-gray-900">Customers</h2>
          <p className="text-gray-500 text-sm">{customers.length} registered customers</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 gradient-teal text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-glow">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-teal rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
          <div><div className="text-xl font-heading font-800 text-gray-900">{customers.length}</div><div className="text-gray-500 text-sm">Total Customers</div></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-white" /></div>
          <div><div className="text-xl font-heading font-800 text-gray-900">{formatCurrency(totalBusiness)}</div><div className="text-gray-500 text-sm">Total Business</div></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-rose rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-white" /></div>
          <div><div className="text-xl font-heading font-800 text-rose-600">{formatCurrency(totalOutstanding)}</div><div className="text-gray-500 text-sm">Outstanding (Udhar)</div></div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                  <div className="text-gray-400 text-xs">{c.joinDate}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" />{c.phone}</div>
              {c.email && <div className="flex items-center gap-2 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{c.email}</div>}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(c.totalPurchases)}</div>
                <div className="text-xs text-gray-400">Total Bought</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-semibold ${c.outstanding > 0 ? "text-red-500" : "text-green-600"}`}>{formatCurrency(c.outstanding)}</div>
                <div className="text-xs text-gray-400">Outstanding</div>
              </div>
            </div>
            {c.outstanding > 0 && (
              <div className="mt-2 px-2.5 py-1.5 bg-red-50 rounded-lg text-xs text-red-600 font-medium text-center">
                Credit Limit: {formatCurrency(c.creditLimit)}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card border border-gray-100">
          <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-400 text-sm">No customers found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-700 text-gray-900">{editCustomer ? "Edit Customer" : "Add Customer"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Full Name *", key: "name", type: "text" },
                { label: "Phone *", key: "phone", type: "tel" },
                { label: "Email", key: "email", type: "email" },
                { label: "Address", key: "address", type: "text" },
                { label: "Credit Limit (₨)", key: "creditLimit", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof Customer] as string | number || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2.5 gradient-teal text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-glow">
                {editCustomer ? "Update" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
