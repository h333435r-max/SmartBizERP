import { useState, useRef } from "react";
import { getSales, getSettings, formatCurrency, formatDate, type Sale, type SaleItem } from "@/lib/data";
import { Search, TrendingUp, DollarSign, CreditCard, Eye, X, Printer, MessageCircle } from "lucide-react";

function buildWhatsAppMessage(sale: Sale & { tax?: number; taxRate?: number }, shopName: string, shopPhone: string): string {
  const lines = [
    `*${shopName}*`,
    `📞 ${shopPhone}`,
    `━━━━━━━━━━━━━━━━━━`,
    `*Invoice: ${sale.invoiceNo}*`,
    `Date: ${sale.date}`,
    `Customer: ${sale.customerName}`,
    `━━━━━━━━━━━━━━━━━━`,
    `*Items:*`,
    ...sale.items.map((item: SaleItem, i: number) => `${i + 1}. ${item.productName} x${item.qty} = ₨${(item.price * item.qty).toLocaleString()}`),
    `━━━━━━━━━━━━━━━━━━`,
    `Subtotal: ₨${sale.subtotal.toLocaleString()}`,
    sale.discount > 0 ? `Discount: -₨${sale.discount.toLocaleString()}` : null,
    (sale as any).tax > 0 ? `GST (${(sale as any).taxRate}%): ₨${(sale as any).tax.toLocaleString()}` : null,
    `*TOTAL: ₨${sale.total.toLocaleString()}*`,
    `Paid: ₨${sale.paid.toLocaleString()}`,
    sale.total - sale.paid > 0 ? `Balance: ₨${(sale.total - sale.paid).toLocaleString()}` : null,
    `━━━━━━━━━━━━━━━━━━`,
    `Thank you for your business! 🙏`,
    `Powered by SmartBiz ERP`,
  ].filter(Boolean);
  return lines.join("\n");
}

function PrintInvoice({ sale, onClose }: { sale: Sale & { tax?: number; taxRate?: number }; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const shopSettings = getSettings();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win || !content) return;
    win.document.write(`
      <html><head><title>Invoice ${sale.invoiceNo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 16px; }
        .shop-name { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
        td { padding: 8px; border: 1px solid #ddd; font-size: 12px; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #666; border-top: 1px dashed #999; padding-top: 12px; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleWhatsApp = () => {
    const msg = buildWhatsAppMessage(sale, shopSettings.name, shopSettings.phone);
    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-heading font-700 text-gray-900">Invoice — {sale.invoiceNo}</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleWhatsApp} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl font-semibold text-sm transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 gradient-teal text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div ref={printRef} className="p-6">
          <div className="text-center border-b-2 border-gray-900 pb-4 mb-4">
            <div className="text-2xl font-bold text-gray-900">{shopSettings.name}</div>
            <div className="text-sm text-gray-600">{shopSettings.tagline}</div>
            <div className="text-sm text-gray-600">Phone: {shopSettings.phone} | {shopSettings.address}</div>
            <div className="text-base font-bold mt-2">Invoice: {sale.invoiceNo}</div>
            <div className="text-sm text-gray-600">Date: {new Date(sale.date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</div>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <div><span className="text-gray-500">Customer:</span> <strong>{sale.customerName}</strong></div>
            <div><span className="text-gray-500">Payment:</span> <strong>{sale.paymentMethod}</strong></div>
          </div>
          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">#</th>
                <th className="border border-gray-300 p-2 text-left">Item</th>
                <th className="border border-gray-300 p-2 text-right">Qty</th>
                <th className="border border-gray-300 p-2 text-right">Price</th>
                <th className="border border-gray-300 p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item: SaleItem, i: number) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{i + 1}</td>
                  <td className="border border-gray-300 p-2">{item.productName}</td>
                  <td className="border border-gray-300 p-2 text-right">{item.qty}</td>
                  <td className="border border-gray-300 p-2 text-right">₨ {item.price.toLocaleString()}</td>
                  <td className="border border-gray-300 p-2 text-right">₨ {(item.price * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ml-auto w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span>₨ {sale.subtotal.toLocaleString()}</span></div>
            {sale.discount > 0 && <div className="flex justify-between text-red-600"><span>Discount:</span><span>- ₨ {sale.discount.toLocaleString()}</span></div>}
            {(sale as any).tax > 0 && <div className="flex justify-between text-blue-600"><span>GST ({(sale as any).taxRate}%):</span><span>+ ₨ {(sale as any).tax.toLocaleString()}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-gray-900 pt-1 mt-1">
              <span>TOTAL:</span><span>₨ {sale.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-700"><span>Paid:</span><span>₨ {sale.paid.toLocaleString()}</span></div>
            {sale.total - sale.paid > 0 && <div className="flex justify-between text-red-600 font-semibold"><span>Balance:</span><span>₨ {(sale.total - sale.paid).toLocaleString()}</span></div>}
          </div>
          <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400 text-sm text-gray-500">
            <div>Thank you for your business!</div>
            <div>Powered by SmartBiz ERP</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sales() {
  const [sales] = useState(getSales());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [printSale, setPrintSale] = useState<Sale | null>(null);
  const shopSettings = getSettings();

  const filtered = sales.filter((s) => {
    const m = s.invoiceNo.toLowerCase().includes(search.toLowerCase()) || s.customerName.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === "All" || s.status === statusFilter.toLowerCase());
  });

  const totalSales = sales.reduce((s, x) => s + x.total, 0);
  const totalPaid = sales.reduce((s, x) => s + x.paid, 0);
  const totalCredit = sales.reduce((s, x) => s + (x.total - x.paid), 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {printSale && <PrintInvoice sale={printSale} onClose={() => setPrintSale(null)} />}
      <div>
        <h2 className="text-xl font-heading font-700 text-gray-900">Sales</h2>
        <p className="text-gray-500 text-sm">{sales.length} total transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Sales", value: formatCurrency(totalSales), icon: TrendingUp, gradient: "gradient-teal", text: "text-brand-600" },
          { label: "Total Collected", value: formatCurrency(totalPaid), icon: DollarSign, gradient: "gradient-blue", text: "text-navy-600" },
          { label: "Outstanding", value: formatCurrency(totalCredit), icon: CreditCard, gradient: "gradient-rose", text: "text-rose-600" },
        ].map(({ label, value, icon: Icon, gradient, text }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className={`text-xl font-heading font-800 ${text}`}>{value}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or customer..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none" />
        </div>
        <div className="flex gap-2">
          {["All", "Paid", "Partial", "Credit"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? "gradient-teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Invoice", "Customer", "Date", "Items", "Total", "Paid", "Balance", "Method", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-navy-600">{s.invoiceNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(s.date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.items.length}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(s.total)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">{formatCurrency(s.paid)}</td>
                  <td className="px-4 py-3 text-sm text-red-500 font-semibold">{formatCurrency(s.total - s.paid)}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{s.paymentMethod}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${s.status === "paid" ? "bg-green-50 text-green-700" : s.status === "partial" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"}`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewSale(s)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg" title="View"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setPrintSale(s)} className="p-1.5 hover:bg-green-50 text-green-500 rounded-lg" title="Print"><Printer className="w-3.5 h-3.5" /></button>
                      <button onClick={() => {
                        const msg = buildWhatsAppMessage(s, shopSettings.name, shopSettings.phone);
                        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                      }} className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg" title="WhatsApp">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No sales found</div>}
        </div>
      </div>

      {/* View Modal */}
      {viewSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-700 text-gray-900">{viewSale.invoiceNo}</h3>
                <p className="text-gray-500 text-sm">{formatDate(viewSale.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const msg = buildWhatsAppMessage(viewSale, shopSettings.name, shopSettings.phone);
                  window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                }} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-xl text-xs font-semibold hover:bg-green-600">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button onClick={() => { setPrintSale(viewSale); setViewSale(null); }} className="flex items-center gap-1.5 px-3 py-1.5 gradient-teal text-white rounded-xl text-xs font-semibold hover:opacity-90">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button onClick={() => setViewSale(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-900">{viewSale.customerName}</span>
              </div>
              <table className="w-full mb-4">
                <thead><tr className="text-xs text-gray-400 uppercase"><th className="text-left pb-2">Item</th><th className="text-right pb-2">Qty</th><th className="text-right pb-2">Price</th><th className="text-right pb-2">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {viewSale.items.map((item, i) => (
                    <tr key={i} className="text-sm">
                      <td className="py-1.5 text-gray-700">{item.productName}</td>
                      <td className="py-1.5 text-right text-gray-500">{item.qty}</td>
                      <td className="py-1.5 text-right text-gray-500">{formatCurrency(item.price)}</td>
                      <td className="py-1.5 text-right font-semibold text-gray-900">{formatCurrency(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(viewSale.subtotal)}</span></div>
                {viewSale.discount > 0 && <div className="flex justify-between text-gray-500"><span>Discount</span><span>- {formatCurrency(viewSale.discount)}</span></div>}
                {(viewSale as any).tax > 0 && <div className="flex justify-between text-blue-600"><span>GST ({(viewSale as any).taxRate}%)</span><span>+ {formatCurrency((viewSale as any).tax)}</span></div>}
                <div className="flex justify-between font-heading font-700 text-gray-900 text-base border-t pt-2"><span>Total</span><span className="text-brand-600">{formatCurrency(viewSale.total)}</span></div>
                <div className="flex justify-between text-green-600 font-semibold"><span>Paid</span><span>{formatCurrency(viewSale.paid)}</span></div>
                {viewSale.total - viewSale.paid > 0 && <div className="flex justify-between text-red-500 font-semibold"><span>Balance</span><span>{formatCurrency(viewSale.total - viewSale.paid)}</span></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
