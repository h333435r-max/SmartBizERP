import { useState } from "react";
import { getCustomers, saveCustomers, getSales, saveSales, formatCurrency, formatDate, type Customer, type Sale } from "@/lib/data";
import { CreditCard, Search, Plus, X, AlertCircle, CheckCircle, Clock, DollarSign, Users, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

interface PaymentRecord {
  date: string;
  amount: number;
  note: string;
}

export default function Credit() {
  const [customers, setCustomers] = useState(getCustomers());
  const [sales, setSales] = useState(getSales());
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [payNote, setPayNote] = useState("");

  const creditCustomers = customers.filter((c) => c.outstanding > 0);
  const filtered = creditCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  const totalOutstanding = creditCustomers.reduce((s, c) => s + c.outstanding, 0);

  const getCustomerSales = (customerId: string): Sale[] =>
    sales.filter((s) => s.customerId === customerId && s.status !== "paid");

  const getPaymentHistory = (customerId: string): PaymentRecord[] => {
    const key = `erp_payments_${customerId}`;
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  };

  const savePaymentHistory = (customerId: string, records: PaymentRecord[]) => {
    localStorage.setItem(`erp_payments_${customerId}`, JSON.stringify(records));
  };

  const handleRecordPayment = () => {
    if (!selectedCustomer || !payAmount || Number(payAmount) <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    const amount = Number(payAmount);
    if (amount > selectedCustomer.outstanding) {
      toast.error("Payment exceeds outstanding balance");
      return;
    }

    // Update customer outstanding
    const updatedCustomers = customers.map((c) =>
      c.id === selectedCustomer.id ? { ...c, outstanding: Math.max(0, c.outstanding - amount) } : c
    );
    saveCustomers(updatedCustomers);
    setCustomers(updatedCustomers);

    // Update sales — reduce unpaid amounts
    let remaining = amount;
    const updatedSales = sales.map((s) => {
      if (s.customerId !== selectedCustomer.id || s.status === "paid" || remaining <= 0) return s;
      const balance = s.total - s.paid;
      const applying = Math.min(remaining, balance);
      remaining -= applying;
      const newPaid = s.paid + applying;
      const newStatus = newPaid >= s.total ? "paid" : "partial";
      return { ...s, paid: newPaid, status: newStatus as Sale["status"] };
    });
    saveSales(updatedSales);
    setSales(updatedSales);

    // Save payment record
    const history = getPaymentHistory(selectedCustomer.id);
    savePaymentHistory(selectedCustomer.id, [
      { date: new Date().toISOString().split("T")[0], amount, note: payNote || "Payment received" },
      ...history,
    ]);

    toast.success(`Payment of ${formatCurrency(amount)} recorded!`);
    setSelectedCustomer(updatedCustomers.find((c) => c.id === selectedCustomer.id) || null);
    setShowPayModal(false);
    setPayAmount("");
    setPayNote("");
  };

  const overdueDays = (dateStr: string): number => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-heading font-700 text-gray-900">Credit (Udhar) Management</h2>
        <p className="text-gray-500 text-sm">Track outstanding balances and record payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-rose rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-white" /></div>
          <div>
            <div className="text-xl font-heading font-800 text-rose-600">{formatCurrency(totalOutstanding)}</div>
            <div className="text-gray-500 text-sm">Total Outstanding</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
          <div>
            <div className="text-xl font-heading font-800 text-gray-900">{creditCustomers.length}</div>
            <div className="text-gray-500 text-sm">Customers with Credit</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 gradient-teal rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
          <div>
            <div className="text-xl font-heading font-800 text-gray-900">
              {formatCurrency(customers.reduce((s, c) => s + c.creditLimit, 0))}
            </div>
            <div className="text-gray-500 text-sm">Total Credit Limit</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Customer List */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-card border border-gray-100">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <p className="text-gray-500 text-sm font-medium">No outstanding balances!</p>
                <p className="text-gray-400 text-xs mt-1">All customers are clear.</p>
              </div>
            ) : (
              filtered.map((c) => {
                const creditSales = getCustomerSales(c.id);
                const oldest = creditSales.length > 0 ? creditSales[creditSales.length - 1] : null;
                const days = oldest ? overdueDays(oldest.date) : 0;
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`w-full text-left bg-white rounded-2xl p-4 shadow-card border transition-all hover:shadow-md ${isSelected ? "border-brand-400 ring-2 ring-brand-100" : "border-gray-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                        <div className="text-gray-400 text-xs">{c.phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-rose-600 font-700 text-sm">{formatCurrency(c.outstanding)}</div>
                        {days > 0 && (
                          <div className={`text-xs font-medium ${days > 30 ? "text-red-500" : days > 7 ? "text-orange-500" : "text-yellow-600"}`}>
                            {days}d overdue
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-rose-400 rounded-full h-1.5" style={{ width: `${Math.min(100, (c.outstanding / c.creditLimit) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{((c.outstanding / c.creditLimit) * 100).toFixed(0)}% of limit</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Customer Detail */}
        <div>
          {selectedCustomer ? (
            <div className="space-y-3">
              {/* Customer Card */}
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 gradient-rose rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-heading font-700 text-gray-900">{selectedCustomer.name}</div>
                      <div className="text-gray-500 text-sm">{selectedCustomer.phone}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowPayModal(true); setPayAmount(""); setPayNote(""); }}
                    className="flex items-center gap-2 gradient-teal text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 shadow-glow"
                  >
                    <Plus className="w-4 h-4" /> Record Payment
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Outstanding", value: formatCurrency(selectedCustomer.outstanding), color: "text-rose-600" },
                    { label: "Credit Limit", value: formatCurrency(selectedCustomer.creditLimit), color: "text-gray-900" },
                    { label: "Total Purchases", value: formatCurrency(selectedCustomer.totalPurchases), color: "text-brand-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className={`font-700 text-sm ${color}`}>{value}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unpaid Sales */}
              {getCustomerSales(selectedCustomer.id).length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                  <h3 className="font-heading font-700 text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" /> Unpaid Invoices
                  </h3>
                  <div className="space-y-2">
                    {getCustomerSales(selectedCustomer.id).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{s.invoiceNo}</div>
                          <div className="text-xs text-gray-500">{formatDate(s.date)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(s.total)}</div>
                          <div className="text-xs text-rose-500">Balance: {formatCurrency(s.total - s.paid)}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${s.status === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment History */}
              <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                <h3 className="font-heading font-700 text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-green-500" /> Payment History
                </h3>
                {getPaymentHistory(selectedCustomer.id).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No payments recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {getPaymentHistory(selectedCustomer.id).map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{p.note}</div>
                          <div className="text-xs text-gray-500">{formatDate(p.date)}</div>
                        </div>
                        <div className="text-green-600 font-700 text-sm">+{formatCurrency(p.amount)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-card border border-gray-100 h-full flex flex-col items-center justify-center">
              <CreditCard className="w-14 h-14 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium">Select a customer</p>
              <p className="text-gray-400 text-sm mt-1">Click a customer to view their credit details and payment history</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-700 text-gray-900">Record Payment</h3>
                <p className="text-gray-500 text-sm">{selectedCustomer.name}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-rose-50 rounded-xl text-center">
                <div className="text-rose-600 font-700 text-lg">{formatCurrency(selectedCustomer.outstanding)}</div>
                <div className="text-gray-500 text-xs">Total Outstanding</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Payment Amount (₨) *</label>
                <input
                  type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))}
                  max={selectedCustomer.outstanding} placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <div className="flex gap-2 mt-2">
                  {[selectedCustomer.outstanding / 4, selectedCustomer.outstanding / 2, selectedCustomer.outstanding].map((v, i) => (
                    <button key={i} onClick={() => setPayAmount(Math.round(v))} className="flex-1 py-1.5 bg-gray-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-xs font-semibold transition-colors">
                      {i === 0 ? "25%" : i === 1 ? "50%" : "Full"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Note</label>
                <input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="e.g. Cash received" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              {payAmount && Number(payAmount) > 0 && (
                <div className="p-3 bg-green-50 rounded-xl text-sm">
                  <div className="flex justify-between text-green-700">
                    <span>Remaining after payment:</span>
                    <span className="font-700">{formatCurrency(selectedCustomer.outstanding - Number(payAmount))}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowPayModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
              <button onClick={handleRecordPayment} className="px-4 py-2.5 gradient-teal text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-glow">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
