import { useState, useEffect, useRef } from "react";
import { getProducts, getCustomers, getSales, saveSales, saveProducts, formatCurrency, generateId, getSettings, type Product, type SaleItem } from "@/lib/data";
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Printer, CheckCircle, X, ScanLine, Keyboard, MessageCircle, Percent } from "lucide-react";
import { toast } from "sonner";

interface CartItem extends SaleItem {
  unit: string;
  maxStock: number;
  itemTaxRate: number; // resolved tax rate for this item
}

// Build WhatsApp message from sale data
function buildWhatsAppMessage(sale: any, shopName: string, shopPhone: string): string {
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
    sale.tax > 0 ? `GST (${sale.taxRate}%): ₨${sale.tax.toLocaleString()}` : null,
    `*TOTAL: ₨${sale.total.toLocaleString()}*`,
    `Paid: ₨${sale.paid.toLocaleString()}`,
    sale.total - sale.paid > 0 ? `Balance: ₨${(sale.total - sale.paid).toLocaleString()}` : null,
    `━━━━━━━━━━━━━━━━━━`,
    `Thank you for your business! 🙏`,
    `Powered by SmartBiz ERP`,
  ].filter(Boolean);
  return lines.join("\n");
}

// Invoice Print Component
function PrintInvoice({ sale, shopSettings, onClose }: { sale: any; shopSettings: any; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win || !content) return;
    win.document.write(`
      <html><head><title>Invoice</title>
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
    const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-heading font-700 text-gray-900">Invoice Preview</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleWhatsApp} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl font-semibold text-sm transition-colors">
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
            {shopSettings.taxNo && <div className="text-xs text-gray-500">NTN: {shopSettings.taxNo}</div>}
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
            {sale.tax > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>GST ({sale.taxRate}%):</span><span>+ ₨ {sale.tax.toLocaleString()}</span>
              </div>
            )}
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

export default function POS() {
  const shopSettings = getSettings();
  const [products] = useState(getProducts());
  const [customers] = useState(getCustomers());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paid, setPaid] = useState<number | "">("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [applyTax, setApplyTax] = useState(true);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const globalTaxRate = shopSettings.globalTaxRate;

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  useEffect(() => {
    if (barcodeMode && barcodeRef.current) barcodeRef.current.focus();
  }, [barcodeMode]);

  const resolveItemTaxRate = (product: Product): number => {
    if (!applyTax) return 0;
    return product.taxRate > 0 ? product.taxRate : globalTaxRate;
  };

  const handleBarcodeEnter = () => {
    const code = barcodeInput.trim();
    if (!code) return;
    const product = products.find((p) => p.barcode === code || p.sku === code);
    if (product) { addToCart(product); toast.success(`Added: ${product.name}`); }
    else toast.error(`No product found for: ${code}`);
    setBarcodeInput("");
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) { toast.error("Out of stock!"); return; }
    const itemTaxRate = resolveItemTaxRate(product);
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) { toast.warning("Max stock reached"); return prev; }
        return prev.map((c) => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { productId: product.id, productName: product.name, qty: 1, price: product.sellPrice, discount: 0, unit: product.unit, maxStock: product.stock, itemTaxRate }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((c) => {
      if (c.productId !== productId) return c;
      const newQty = c.qty + delta;
      if (newQty <= 0) return c;
      if (newQty > c.maxStock) { toast.warning("Max stock reached"); return c; }
      return { ...c, qty: newQty };
    }));
  };

  const removeItem = (productId: string) => setCart((prev) => prev.filter((c) => c.productId !== productId));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty - c.discount, 0);
  const totalDiscount = discount;
  // Weighted average tax rate across items
  const taxAmount = applyTax ? Math.round(cart.reduce((s, c) => {
    const lineTotal = c.price * c.qty - c.discount;
    return s + lineTotal * (c.itemTaxRate / 100);
  }, 0)) : 0;
  const effectiveTaxRate = subtotal > 0 ? Math.round((taxAmount / subtotal) * 100) : globalTaxRate;
  const total = subtotal - totalDiscount + taxAmount;
  const paidAmount = typeof paid === "number" ? paid : 0;
  const change = paidAmount - total;

  const handleCheckout = () => {
    if (cart.length === 0) { toast.error("Cart is empty!"); return; }
    const customer = customers.find((c) => c.id === selectedCustomer);
    const invoiceNo = `INV-2026-${String(getSales().length + 1).padStart(3, "0")}`;
    const saleData = {
      id: generateId(), invoiceNo,
      customerId: selectedCustomer,
      customerName: customer?.name || "Walk-in Customer",
      items: cart.map(({ unit, maxStock, itemTaxRate, ...rest }) => rest),
      subtotal, discount: totalDiscount, tax: taxAmount, taxRate: effectiveTaxRate, total,
      paid: paidAmount || total,
      change: Math.max(0, change),
      paymentMethod,
      date: new Date().toISOString().split("T")[0],
      status: (paidAmount >= total ? "paid" : paidAmount > 0 ? "partial" : "credit") as "paid" | "partial" | "credit",
    };

    const sales = getSales();
    saveSales([...sales, saleData]);

    const allProducts = getProducts();
    const updatedProducts = allProducts.map((p) => {
      const cartItem = cart.find((c) => c.productId === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });
    saveProducts(updatedProducts);

    setLastSale(saleData);
    setShowSuccess(true);
    setCart([]);
    setDiscount(0);
    setPaid("");
    setSelectedCustomer("");
    toast.success(`Sale completed! ${invoiceNo}`);
  };

  if (showSuccess && lastSale) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {showPrint && <PrintInvoice sale={lastSale} shopSettings={shopSettings} onClose={() => setShowPrint(false)} />}
        <div className="bg-white rounded-2xl p-10 shadow-card text-center max-w-md w-full border border-gray-100 animate-fade-in">
          <div className="w-20 h-20 gradient-teal rounded-full flex items-center justify-center mx-auto mb-5 shadow-glow">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-heading font-800 text-gray-900 mb-2">Sale Successful!</h2>
          <p className="text-gray-500 mb-1">Invoice: <span className="font-semibold text-navy-600">{lastSale.invoiceNo}</span></p>
          <p className="text-gray-500 mb-1">Customer: <span className="font-semibold text-gray-900">{lastSale.customerName}</span></p>
          <p className="text-gray-500 mb-1">Total: <span className="font-semibold text-gray-900">{formatCurrency(lastSale.total)}</span></p>
          {lastSale.tax > 0 && <p className="text-blue-600 text-sm mb-1">GST ({lastSale.taxRate}%): <span className="font-semibold">{formatCurrency(lastSale.tax)}</span></p>}
          {lastSale.change > 0 && <p className="text-green-600 mb-4">Change: <span className="font-semibold">{formatCurrency(lastSale.change)}</span></p>}
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <button onClick={() => setShowSuccess(false)} className="flex items-center gap-2 px-4 py-2.5 gradient-teal text-white rounded-xl font-semibold text-sm hover:opacity-90">
              <Plus className="w-4 h-4" /> New Sale
            </button>
            <button onClick={() => setShowPrint(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={() => {
              const msg = buildWhatsAppMessage(lastSale, shopSettings.name, shopSettings.phone);
              window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
            }} className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 mb-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setBarcodeMode(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!barcodeMode ? "gradient-teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <Keyboard className="w-3.5 h-3.5" /> Search by Name
            </button>
            <button onClick={() => setBarcodeMode(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${barcodeMode ? "gradient-teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <ScanLine className="w-3.5 h-3.5" /> Barcode Scanner
            </button>
            <button onClick={() => setApplyTax(!applyTax)} className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${applyTax ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
              <Percent className="w-3.5 h-3.5" /> GST {applyTax ? `${globalTaxRate}%` : "Off"}
            </button>
          </div>

          {!barcodeMode ? (
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2.5 mb-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product by name or SKU..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" autoFocus />
              {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-3 bg-brand-50 border-2 border-brand-300 rounded-xl px-3 py-2.5 flex-1">
                <ScanLine className="w-4 h-4 text-brand-500" />
                <input ref={barcodeRef} value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleBarcodeEnter(); }} placeholder="Scan barcode or type barcode number + Enter..." className="bg-transparent flex-1 text-sm text-gray-700 outline-none placeholder:text-brand-400" />
              </div>
              <button onClick={handleBarcodeEnter} className="px-3 py-2.5 gradient-teal text-white rounded-xl text-sm font-semibold hover:opacity-90">Add</button>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? "gradient-teal text-white shadow-glow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {search && filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <div className="text-sm">No products found for "{search}"</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((product) => {
                const taxRate = resolveItemTaxRate(product);
                return (
                  <button key={product.id} onClick={() => addToCart(product)} className={`bg-white rounded-xl p-3 shadow-sm border transition-all hover:shadow-card hover:border-brand-300 text-left ${product.stock <= 0 ? "opacity-50 cursor-not-allowed border-gray-100" : "border-gray-100"}`}>
                    <div className="w-full h-16 rounded-lg bg-gradient-to-br from-brand-50 to-navy-50 flex items-center justify-center mb-2 text-2xl">
                      {product.category === "Grocery" ? "🛒" : product.category === "Medicine" ? "💊" : product.category === "Mobile" ? "📱" : product.category === "Electronics" ? "💻" : product.category === "Garments" ? "👕" : product.category === "Hardware" ? "🔧" : "📦"}
                    </div>
                    <div className="text-gray-900 text-xs font-semibold leading-tight mb-1 line-clamp-2">{product.name}</div>
                    <div className="text-brand-600 font-700 text-sm">{formatCurrency(product.sellPrice)}</div>
                    {taxRate > 0 && <div className="text-xs text-blue-500">+GST {taxRate}%</div>}
                    <div className={`text-xs mt-0.5 ${product.stock <= product.minStock ? "text-orange-500" : "text-gray-400"}`}>Stock: {product.stock}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full xl:w-80 flex flex-col bg-white rounded-2xl shadow-card border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-500" />
          <span className="font-heading font-700 text-gray-900">Cart</span>
          <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-lg font-semibold">{cart.length} items</span>
        </div>

        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <User className="w-4 h-4 text-gray-400" />
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="bg-transparent flex-1 text-sm text-gray-700 outline-none">
              <option value="">Walk-in Customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <div className="text-sm">Add products to cart</div>
              <div className="text-xs mt-1 text-gray-300">Search or scan barcode</div>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 text-xs font-semibold truncate">{item.productName}</div>
                <div className="text-brand-600 text-xs font-semibold">{formatCurrency(item.price)}/{item.unit}</div>
                {item.itemTaxRate > 0 && <div className="text-xs text-blue-400">GST {item.itemTaxRate}%</div>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                <button onClick={() => updateQty(item.productId, 1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="text-gray-900 text-xs font-semibold w-16 text-right">{formatCurrency(item.price * item.qty)}</div>
              <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span></div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Discount</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} min={0} className="w-24 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-brand-400" />
          </div>
          {applyTax && taxAmount > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span className="flex items-center gap-1"><Percent className="w-3 h-3" />GST ({effectiveTaxRate}%)</span>
              <span className="font-semibold">+ {formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-heading font-700 text-lg border-t border-gray-100 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-brand-600">{formatCurrency(total)}</span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {["Cash", "Card", "Transfer", "Credit"].map((m) => (
              <button key={m} onClick={() => setPaymentMethod(m)} className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${paymentMethod === m ? "gradient-teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{m}</button>
            ))}
          </div>

          {paymentMethod !== "Credit" && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Amount Paid</label>
              <input type="number" value={paid} onChange={(e) => setPaid(Number(e.target.value))} placeholder={formatCurrency(total)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
              {typeof paid === "number" && paid > 0 && (
                <div className="mt-1 text-xs text-gray-500">Change: <span className={`font-semibold ${change >= 0 ? "text-green-600" : "text-red-500"}`}>{formatCurrency(Math.max(0, change))}</span></div>
              )}
            </div>
          )}

          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full gradient-teal text-white font-semibold py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}
