import { useState } from "react";
import { getExpenses, saveExpenses, generateId, formatCurrency, formatDate, type Expense } from "@/lib/data";
import { Plus, Search, Trash2, X, DollarSign, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CATEGORIES = ["Rent", "Utilities", "Salaries", "Supplies", "Transport", "Marketing", "Maintenance", "Taxes", "Other"];
const COLORS = ["#14b896", "#3362ef", "#f97316", "#8b5cf6", "#f43f5e", "#06b6d4", "#eab308", "#64748b", "#ec4899"];

export default function Expenses() {
  const [expenses, setExpenses] = useState(getExpenses());
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Expense>>({});

  const filtered = expenses.filter((e) => {
    const m = e.title.toLowerCase().includes(search.toLowerCase());
    return m && (filterCat === "All" || e.category === filterCat);
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const thisMonth = expenses.filter((e) => e.date.startsWith("2026-08")).reduce((s, e) => s + e.amount, 0);

  const categoryTotals = CATEGORIES.map((cat, i) => ({
    name: cat,
    value: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: COLORS[i],
  })).filter((c) => c.value > 0);

  const handleSave = () => {
    if (!form.title || !form.amount || !form.category) { toast.error("Please fill all required fields"); return; }
    const newExpense: Expense = {
      id: generateId(), title: form.title!, category: form.category!, amount: form.amount!,
      date: form.date || new Date().toISOString().split("T")[0], note: form.note || "",
    };
    const updated = [...expenses, newExpense];
    saveExpenses(updated);
    setExpenses(updated);
    setShowModal(false);
    setForm({});
    toast.success("Expense added!");
  };

  const handleDelete = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    saveExpenses(updated);
    setExpenses(updated);
    toast.success("Expense deleted");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-700 text-gray-900">Expenses</h2>
          <p className="text-gray-500 text-sm">{expenses.length} total expenses</p>
        </div>
        <button onClick={() => { setForm({ category: "Rent", date: new Date().toISOString().split("T")[0] }); setShowModal(true); }} className="flex items-center gap-2 gradient-teal text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-glow">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Summary + Chart */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
              <div className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center mb-3"><TrendingDown className="w-5 h-5 text-white" /></div>
              <div className="text-xl font-heading font-800 text-gray-900">{formatCurrency(total)}</div>
              <div className="text-gray-500 text-sm">Total Expenses</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
              <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center mb-3"><DollarSign className="w-5 h-5 text-white" /></div>
              <div className="text-xl font-heading font-800 text-gray-900">{formatCurrency(thisMonth)}</div>
              <div className="text-gray-500 text-sm">This Month</div>
            </div>
          </div>
          {/* Category Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
            <h3 className="font-heading font-700 text-gray-900 mb-3">By Category</h3>
            {categoryTotals.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryTotals} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {categoryTotals.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {categoryTotals.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                        <span className="text-gray-600">{c.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="text-center text-gray-400 text-sm py-8">No data</div>}
          </div>
        </div>

        {/* Expense List */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
            </div>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-gray-100 border-0 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer">
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Title", "Category", "Date", "Amount", "Note", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{e.title}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">{e.category}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-rose-600">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{e.note || "-"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No expenses found</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-700 text-gray-900">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Title *</label>
                <input value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" placeholder="e.g. Shop Rent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category *</label>
                  <select value={form.category || "Rent"} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (₨) *</label>
                  <input type="number" value={form.amount || ""} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date</label>
                <input type="date" value={form.date || ""} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Note</label>
                <input value={form.note || ""} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" placeholder="Optional note..." />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2.5 gradient-teal text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-glow">Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
