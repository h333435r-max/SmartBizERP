import { useRef } from "react";
import { getSales, getExpenses, getProducts, formatCurrency, formatDate } from "@/lib/data";
import { Printer, TrendingUp, DollarSign, CreditCard, Package, FileText, ShoppingCart } from "lucide-react";

export default function DailyReport() {
  const printRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const allSales = getSales();
  const allExpenses = getExpenses();
  const products = getProducts();

  const todaySales = allSales.filter((s) => s.date === today);
  const todayExpenses = allExpenses.filter((e) => e.date === today);

  const totalRevenue = todaySales.reduce((s, x) => s + x.total, 0);
  const totalCollected = todaySales.reduce((s, x) => s + x.paid, 0);
  const totalCredit = todaySales.reduce((s, x) => s + (x.total - x.paid), 0);
  const totalExpenses = todayExpenses.reduce((s, x) => s + x.amount, 0);
  const netProfit = totalCollected - totalExpenses;

  const cashSales = todaySales.filter((s) => s.paymentMethod === "Cash").reduce((s, x) => s + x.paid, 0);
  const cardSales = todaySales.filter((s) => s.paymentMethod === "Card").reduce((s, x) => s + x.paid, 0);
  const transferSales = todaySales.filter((s) => s.paymentMethod === "Transfer").reduce((s, x) => s + x.paid, 0);
  const creditSales = todaySales.filter((s) => s.paymentMethod === "Credit" || s.status === "credit" || s.status === "partial").reduce((s, x) => s + (x.total - x.paid), 0);

  // Top products sold today
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  todaySales.forEach((s) => s.items.forEach((item) => {
    if (!productSalesMap[item.productId]) productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
    productSalesMap[item.productId].qty += item.qty;
    productSalesMap[item.productId].revenue += item.price * item.qty;
  }));
  const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win || !content) return;
    win.document.write(`
      <html><head><title>Daily Report - ${today}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; font-size: 13px; }
        h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
        h2 { font-size: 15px; font-weight: bold; margin: 20px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
        .card .val { font-size: 18px; font-weight: bold; }
        .card .lbl { font-size: 11px; color: #666; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f5; padding: 8px; text-align: left; font-size: 11px; border: 1px solid #ddd; }
        td { padding: 7px 8px; border: 1px solid #eee; font-size: 12px; }
        .breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #999; border-top: 1px dashed #ccc; padding-top: 12px; }
        @media print { body { padding: 12px; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-700 text-gray-900">Daily Report</h2>
          <p className="text-gray-500 text-sm">{formatDate(today)}</p>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 gradient-teal text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 shadow-glow">
          <Printer className="w-4 h-4" /> Print Report
        </button>
      </div>

      <div ref={printRef}>
        {/* Print Header */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold">SmartBiz Store</h1>
          <p className="text-gray-600">Daily Business Report — {formatDate(today)}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, gradient: "gradient-teal", text: "text-brand-600" },
            { label: "Total Collected", value: formatCurrency(totalCollected), icon: DollarSign, gradient: "gradient-blue", text: "text-navy-600" },
            { label: "Credit (Unpaid)", value: formatCurrency(totalCredit), icon: CreditCard, gradient: "gradient-rose", text: "text-rose-600" },
            { label: "Net Profit (Est.)", value: formatCurrency(netProfit), icon: FileText, gradient: netProfit >= 0 ? "gradient-teal" : "gradient-rose", text: netProfit >= 0 ? "text-brand-600" : "text-rose-600" },
          ].map(({ label, value, icon: Icon, gradient, text }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center gap-3">
              <div className={`w-11 h-11 ${gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className={`text-lg font-heading font-800 ${text}`}>{value}</div>
                <div className="text-gray-500 text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
            <h3 className="font-heading font-700 text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-500" /> Payment Method Breakdown
            </h3>
            <div className="space-y-3">
              {[
                { label: "Cash", value: cashSales, color: "bg-green-500", light: "bg-green-50 text-green-700" },
                { label: "Card", value: cardSales, color: "bg-blue-500", light: "bg-blue-50 text-blue-700" },
                { label: "Bank Transfer", value: transferSales, color: "bg-purple-500", light: "bg-purple-50 text-purple-700" },
                { label: "Credit / Udhar", value: creditSales, color: "bg-red-400", light: "bg-red-50 text-red-600" },
              ].map(({ label, value, color, light }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                  <span className="text-sm text-gray-600 flex-1">{label}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${light}`}>{formatCurrency(value)}</span>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className={`${color} rounded-full h-1.5`} style={{ width: totalRevenue > 0 ? `${Math.min(100, (value / totalRevenue) * 100)}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Total Invoices Today:</span>
              <span className="font-700 text-gray-900">{todaySales.length}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Paid Invoices:</span>
              <span className="font-700 text-green-600">{todaySales.filter(s => s.status === "paid").length}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Credit/Partial:</span>
              <span className="font-700 text-orange-600">{todaySales.filter(s => s.status !== "paid").length}</span>
            </div>
          </div>

          {/* Today's Expenses */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
            <h3 className="font-heading font-700 text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-500" /> Today's Expenses
            </h3>
            {todayExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No expenses recorded today</div>
            ) : (
              <div className="space-y-2">
                {todayExpenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{e.title}</div>
                      <div className="text-xs text-gray-400">{e.category}</div>
                    </div>
                    <span className="text-rose-600 font-700 text-sm">{formatCurrency(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
              <span className="text-gray-500 text-sm font-semibold">Total Expenses:</span>
              <span className="text-rose-600 font-800 text-sm">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Today's Invoices */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 mt-4">
          <h3 className="font-heading font-700 text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-navy-500" /> Today's Invoices
          </h3>
          {todaySales.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No sales recorded today</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Invoice", "Customer", "Items", "Total", "Paid", "Balance", "Method", "Status"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {todaySales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm font-semibold text-navy-600">{s.invoiceNo}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{s.customerName}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{s.items.length}</td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-gray-900">{formatCurrency(s.total)}</td>
                      <td className="px-3 py-2.5 text-sm text-green-600 font-semibold">{formatCurrency(s.paid)}</td>
                      <td className="px-3 py-2.5 text-sm text-red-500">{formatCurrency(s.total - s.paid)}</td>
                      <td className="px-3 py-2.5"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{s.paymentMethod}</span></td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${s.status === "paid" ? "bg-green-50 text-green-700" : s.status === "partial" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"}`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 mt-4">
            <h3 className="font-heading font-700 text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-500" /> Top Products Sold Today
            </h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full gradient-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400">Qty sold: {p.qty}</div>
                  </div>
                  <span className="text-brand-600 font-700 text-sm">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="bg-navy-900 text-white rounded-2xl p-5 mt-4">
          <h3 className="font-heading font-700 mb-4 text-sm uppercase tracking-wide opacity-70">Day Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Revenue", value: formatCurrency(totalRevenue), sub: "Total billed" },
              { label: "Collected", value: formatCurrency(totalCollected), sub: "Cash received" },
              { label: "Expenses", value: formatCurrency(totalExpenses), sub: "All costs" },
              { label: "Net Profit", value: formatCurrency(netProfit), sub: "Collected - Expenses", highlight: true },
            ].map(({ label, value, sub, highlight }) => (
              <div key={label} className={`p-3 rounded-xl ${highlight ? "bg-brand-500" : "bg-white/10"}`}>
                <div className="text-lg font-800">{value}</div>
                <div className="text-sm font-semibold opacity-90">{label}</div>
                <div className="text-xs opacity-60 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Print Footer */}
        <div className="text-center mt-4 text-xs text-gray-400">
          Report generated by SmartBiz ERP • {new Date().toLocaleString("en-PK")}
        </div>
      </div>
    </div>
  );
}
