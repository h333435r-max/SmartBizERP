import { getSales, getPurchases, getExpenses, getProducts, formatCurrency, getExpiryStatus } from "@/lib/data";
import {
  TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart,
  AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart2, Activity
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Brain, Lightbulb, AlertCircle, CheckCircle2, TrendingUp as TrendUp } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthlyData = [
  { month: "Mar", sales: 185000, purchases: 120000, profit: 65000 },
  { month: "Apr", sales: 210000, purchases: 145000, profit: 65000 },
  { month: "May", sales: 195000, purchases: 130000, profit: 65000 },
  { month: "Jun", sales: 240000, purchases: 160000, profit: 80000 },
  { month: "Jul", sales: 220000, purchases: 148000, profit: 72000 },
  { month: "Aug", sales: 275000, purchases: 180000, profit: 95000 },
];

const categoryData = [
  { name: "Grocery", value: 35, color: "#14b896" },
  { name: "Mobile", value: 28, color: "#3362ef" },
  { name: "Electronics", value: 18, color: "#f97316" },
  { name: "Garments", value: 12, color: "#8b5cf6" },
  { name: "Others", value: 7, color: "#64748b" },
];

const dailySales = [
  { day: "Mon", amount: 32000 },
  { day: "Tue", amount: 48000 },
  { day: "Wed", amount: 38000 },
  { day: "Thu", amount: 55000 },
  { day: "Fri", amount: 61000 },
  { day: "Sat", amount: 72000 },
  { day: "Sun", amount: 45000 },
];

// --- AI Insights Panel ---
function AIInsightsPanel() {
  const products = getProducts();
  const sales = getSales();
  const expenses = getExpenses();
  const purchases = getPurchases();

  // Analysis
  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalCost = purchases.reduce((s, x) => s + x.total, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const netProfit = totalRevenue - totalCost - totalExpenses;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";
  const marginNum = parseFloat(margin);

  // Top selling (by revenue)
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  sales.forEach((s) => s.items.forEach((item) => {
    if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
    productSales[item.productId].qty += item.qty;
    productSales[item.productId].revenue += item.price * item.qty;
  }));
  const sortedByRevenue = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  const topProducts = sortedByRevenue.slice(0, 3);

  // Low stock + slow movers (low sales but decent stock)
  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const slowMovers = products.filter((p) => {
    const sold = productSales[p.id]?.qty || 0;
    return sold === 0 && p.stock > p.minStock * 2;
  }).slice(0, 3);

  // Credit risk
  const totalOutstanding = sales.reduce((s, x) => s + (x.total - x.paid), 0);
  const creditRatio = totalRevenue > 0 ? ((totalOutstanding / totalRevenue) * 100).toFixed(1) : "0";

  // Sales trend (last 2 months)
  const salesTrend = monthlyData[5].sales > monthlyData[4].sales ? "up" : "down";
  const salesChange = (((monthlyData[5].sales - monthlyData[4].sales) / monthlyData[4].sales) * 100).toFixed(1);

  const insights = [
    {
      type: marginNum >= 20 ? "success" : marginNum >= 10 ? "warning" : "danger",
      icon: marginNum >= 20 ? CheckCircle2 : marginNum >= 10 ? AlertCircle : TrendingDown,
      title: `Profit Margin: ${margin}%`,
      desc: marginNum >= 20
        ? "Excellent! Your margins are healthy. Consider reinvesting in high-demand categories."
        : marginNum >= 10
        ? "Margin is moderate. Review purchase costs or increase sell prices by 5-8%."
        : "Low margin alert. Identify and cut under-performing products immediately.",
    },
    {
      type: salesTrend === "up" ? "success" : "warning",
      icon: salesTrend === "up" ? TrendUp : TrendingDown,
      title: `Sales ${salesTrend === "up" ? "Up" : "Down"} ${salesChange}% vs Last Month`,
      desc: salesTrend === "up"
        ? `Strong growth trend. ${topProducts[0]?.name || "Mobile"} is your best revenue driver.`
        : "Sales declining. Consider promotions or discount campaigns on slow-moving items.",
    },
    {
      type: parseFloat(creditRatio) > 20 ? "danger" : parseFloat(creditRatio) > 10 ? "warning" : "success",
      icon: parseFloat(creditRatio) > 10 ? AlertCircle : CheckCircle2,
      title: `Credit Risk: ${creditRatio}% of Sales on Credit`,
      desc: parseFloat(creditRatio) > 20
        ? `₨ ${totalOutstanding.toLocaleString()} outstanding. Follow up with credit customers urgently.`
        : `Credit exposure is manageable at ₨ ${totalOutstanding.toLocaleString()}.`,
    },
    lowStock.length > 0 ? {
      type: "warning" as const,
      icon: Package,
      title: `${lowStock.length} Products Need Reorder`,
      desc: `Critical: ${lowStock.slice(0, 2).map(p => p.name).join(", ")} are below minimum stock. Place purchase orders.`,
    } : {
      type: "success" as const,
      icon: CheckCircle2,
      title: "Stock Levels Healthy",
      desc: "All products are above minimum stock levels. No immediate reorder needed.",
    },
    slowMovers.length > 0 ? {
      type: "warning" as const,
      icon: TrendingDown,
      title: `${slowMovers.length} Slow-Moving Products`,
      desc: `${slowMovers.map(p => p.name).join(", ")} have not sold yet. Consider bundling or discount offers.`,
    } : {
      type: "success" as const,
      icon: CheckCircle2,
      title: "All Products Selling",
      desc: "No dead stock detected. Every product category has recorded sales.",
    },
  ];

  const recommendations = [
    topProducts[0] && `Reorder "${topProducts[0].name}" — it drives the most revenue (${formatCurrency(topProducts[0].revenue)})`,
    lowStock.length > 0 && `Place purchase orders for ${lowStock.length} low-stock items before they run out`,
    parseFloat(creditRatio) > 15 && `Reduce credit sales — ${creditRatio}% of revenue is uncollected`,
    slowMovers.length > 0 && `Offer 10-15% discount on ${slowMovers[0]?.name} to clear slow-moving stock`,
    marginNum < 15 && "Negotiate better prices with suppliers to improve profit margins",
  ].filter(Boolean).slice(0, 4);

  const typeColors = {
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };
  const iconColors = {
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-700 text-gray-900">AI Business Insights</h3>
          <p className="text-gray-500 text-xs">Smart analysis of your business data — updated in real-time</p>
        </div>
        <span className="ml-auto text-xs bg-purple-50 text-purple-600 font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
          <Activity className="w-3 h-3" /> Live
        </span>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
        {insights.slice(0, 3).map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className={`p-3 rounded-xl border ${typeColors[insight.type as keyof typeof typeColors]}`}>
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColors[insight.type as keyof typeof iconColors]}`} />
                <div>
                  <div className="text-xs font-700 mb-0.5">{insight.title}</div>
                  <div className="text-xs opacity-80 leading-relaxed">{insight.desc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {insights.slice(3).map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className={`p-3 rounded-xl border ${typeColors[insight.type as keyof typeof typeColors]}`}>
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColors[insight.type as keyof typeof iconColors]}`} />
                <div>
                  <div className="text-xs font-700 mb-0.5">{insight.title}</div>
                  <div className="text-xs opacity-80 leading-relaxed">{insight.desc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Products */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-heading font-700 text-gray-900">AI Recommendations</span>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
              <span className="w-5 h-5 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-sm text-gray-700">{rec as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const sales = getSales();
  const purchases = getPurchases();
  const expenses = getExpenses();
  const products = getProducts();
  const customers = getSales().flatMap((s) => [s.customerName]);

  const totalSales = sales.reduce((s, x) => s + x.total, 0);
  const totalPurchases = purchases.reduce((s, x) => s + x.total, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const totalProfit = totalSales - totalPurchases - totalExpenses;
  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const totalOutstanding = sales.reduce((s, x) => s + (x.total - x.paid), 0);
  const expiringProducts = products.filter((p) => { const s = getExpiryStatus(p.expiryDate); return s === "soon" || s === "expired"; });
  const creditCount = sales.filter((s) => s.status !== "paid").length;

  const statCards = [
    { label: "Total Sales", value: formatCurrency(totalSales), change: "+18.2%", up: true, icon: TrendingUp, gradient: "gradient-teal", shadow: "shadow-glow" },
    { label: "Total Profit", value: formatCurrency(totalProfit), change: "+12.5%", up: true, icon: DollarSign, gradient: "gradient-blue", shadow: "shadow-glow-blue" },
    { label: "Total Purchases", value: formatCurrency(totalPurchases), change: "+8.1%", up: false, icon: ShoppingCart, gradient: "gradient-orange", shadow: "" },
    { label: "Outstanding", value: formatCurrency(totalOutstanding), change: `${creditCount} invoices`, up: false, icon: Users, gradient: "gradient-rose", shadow: "" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${card.gradient} rounded-xl flex items-center justify-center ${card.shadow}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${card.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>
              <div className="text-2xl font-heading font-800 text-gray-900">{card.value}</div>
              <div className="text-gray-500 text-sm mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading font-700 text-gray-900">Sales vs Purchases</h3>
              <p className="text-gray-500 text-sm">Last 6 months overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-500 inline-block"></span>Sales</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-navy-500 inline-block"></span>Purchase</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b896" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14b896" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3362ef" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3362ef" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₨${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="sales" stroke="#14b896" strokeWidth={2.5} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="purchases" stroke="#3362ef" strokeWidth={2.5} fill="url(#colorPurchase)" />
              <Area type="monotone" dataKey="profit" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <h3 className="font-heading font-700 text-gray-900 mb-1">Sales by Category</h3>
          <p className="text-gray-500 text-sm mb-4">This month breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-gray-600">{cat.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-700 text-gray-900">This Week Sales</h3>
              <p className="text-gray-500 text-sm">Daily sales performance</p>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" /> Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailySales} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₨${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="amount" fill="#14b896" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex flex-col">
          <h3 className="font-heading font-700 text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Alerts
          </h3>
          <div className="space-y-3 flex-1">
            {expiringProducts.slice(0, 2).map((p) => (
              <div key={`exp-${p.id}`} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 text-sm font-medium truncate">{p.name}</div>
                  <div className="text-red-600 text-xs">
                    {getExpiryStatus(p.expiryDate) === "expired" ? "EXPIRED" : `Expires: ${p.expiryDate}`}
                  </div>
                </div>
              </div>
            ))}
            {lowStock.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 text-sm font-medium truncate">{p.name}</div>
                  <div className="text-orange-600 text-xs">Stock: {p.stock} (Min: {p.minStock})</div>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                All stock levels are healthy
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-heading font-800 text-gray-900">{products.length}</div>
              <div className="text-gray-500 text-xs">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-800 text-gray-900">{sales.length}</div>
              <div className="text-gray-500 text-xs">Sales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-700 text-gray-900">Recent Sales</h3>
          <a href="/sales" className="text-brand-600 text-sm font-medium hover:underline">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">Invoice</th>
                <th className="pb-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">Customer</th>
                <th className="pb-3 text-gray-400 text-xs font-semibold uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="pb-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">Amount</th>
                <th className="pb-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm font-medium text-navy-600">{sale.invoiceNo}</td>
                  <td className="py-3 text-sm text-gray-700">{sale.customerName}</td>
                  <td className="py-3 text-sm text-gray-500 hidden md:table-cell">{sale.date}</td>
                  <td className="py-3 text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${sale.status === "paid" ? "bg-green-50 text-green-700" : sale.status === "partial" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"}`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
