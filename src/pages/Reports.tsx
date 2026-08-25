import { getSales, getPurchases, getExpenses, getProducts, getCustomers, formatCurrency } from "@/lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, BarChart2 } from "lucide-react";

const monthlyData = [
  { month: "Jan", sales: 145000, purchases: 95000, expenses: 38000 },
  { month: "Feb", sales: 162000, purchases: 108000, expenses: 40000 },
  { month: "Mar", sales: 185000, purchases: 120000, expenses: 42000 },
  { month: "Apr", sales: 210000, purchases: 145000, expenses: 45000 },
  { month: "May", sales: 195000, purchases: 130000, expenses: 43000 },
  { month: "Jun", sales: 240000, purchases: 160000, expenses: 48000 },
  { month: "Jul", sales: 220000, purchases: 148000, expenses: 46000 },
  { month: "Aug", sales: 275000, purchases: 180000, expenses: 55000 },
];

const topProducts = [
  { name: "Samsung Galaxy A54", sold: 18, revenue: 756000 },
  { name: "Laptop HP 15", sold: 5, revenue: 325000 },
  { name: "Basmati Rice 5kg", sold: 240, revenue: 132000 },
  { name: "Denim Jeans Men", sold: 85, revenue: 127500 },
  { name: "Cooking Oil 1L", sold: 420, revenue: 92400 },
];

const COLORS = ["#14b896", "#3362ef", "#f97316", "#8b5cf6", "#f43f5e"];

export default function Reports() {
  const sales = getSales();
  const purchases = getPurchases();
  const expenses = getExpenses();
  const products = getProducts();
  const customers = getCustomers();

  const totalSales = sales.reduce((s, x) => s + x.total, 0);
  const totalPurchases = purchases.reduce((s, x) => s + x.total, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0";

  const categoryData = products.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.stock * p.buyPrice;
    return acc;
  }, {});
  const categoryChartData = Object.entries(categoryData).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(totalSales), icon: TrendingUp, gradient: "gradient-teal", change: "+18.2%" },
    { label: "Gross Profit", value: formatCurrency(grossProfit), icon: DollarSign, gradient: "gradient-blue", change: "+14.5%" },
    { label: "Net Profit", value: formatCurrency(netProfit), icon: DollarSign, gradient: "gradient-purple", change: "+11.3%" },
    { label: "Profit Margin", value: `${profitMargin}%`, icon: BarChart2, gradient: "gradient-orange", change: "This Period" },
    { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, gradient: "gradient-rose", change: "+5.2%" },
    { label: "Total Products", value: products.length.toString(), icon: Package, gradient: "gradient-teal", change: "In system" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-heading font-700 text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-500 text-sm">Business performance overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(({ label, value, icon: Icon, gradient, change }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
            <div className={`w-9 h-9 ${gradient} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-heading font-800 text-gray-900 leading-tight">{value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{label}</div>
            <div className="text-xs text-green-500 font-semibold mt-1">{change}</div>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-700 text-gray-900">Monthly P&L Overview</h3>
            <p className="text-gray-500 text-sm">January – August 2026</p>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-500 inline-block"></span>Sales</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-navy-500 inline-block"></span>Purchases</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>Expenses</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₨${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            <Bar dataKey="sales" fill="#14b896" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="purchases" fill="#3362ef" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <h3 className="font-heading font-700 text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0`} style={{ background: COLORS[i] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.sold} units sold</div>
                </div>
                <div className="text-sm font-semibold text-brand-600 whitespace-nowrap">{formatCurrency(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Value by Category */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <h3 className="font-heading font-700 text-gray-900 mb-4">Stock Value by Category</h3>
          {categoryChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryChartData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-gray-600">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="text-center text-gray-400 text-sm py-8">No inventory data</div>}
        </div>
      </div>

      {/* P&L Summary Table */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <h3 className="font-heading font-700 text-gray-900 mb-4">Profit & Loss Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Month", "Sales", "Purchases", "Expenses", "Gross Profit", "Net Profit", "Margin"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyData.map((row) => {
                const gross = row.sales - row.purchases;
                const net = gross - row.expenses;
                const margin = ((net / row.sales) * 100).toFixed(1);
                return (
                  <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{row.month} 2026</td>
                    <td className="px-4 py-3 text-sm text-brand-600 font-semibold">{formatCurrency(row.sales)}</td>
                    <td className="px-4 py-3 text-sm text-navy-600">{formatCurrency(row.purchases)}</td>
                    <td className="px-4 py-3 text-sm text-rose-500">{formatCurrency(row.expenses)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{formatCurrency(gross)}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: net >= 0 ? "#16a34a" : "#dc2626" }}>{formatCurrency(net)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${parseFloat(margin) >= 20 ? "bg-green-50 text-green-700" : parseFloat(margin) >= 10 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"}`}>
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
