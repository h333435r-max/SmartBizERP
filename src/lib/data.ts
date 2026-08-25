// Mock data store using localStorage
export const STORAGE_KEYS = {
  PRODUCTS: "erp_products",
  CUSTOMERS: "erp_customers",
  SUPPLIERS: "erp_suppliers",
  SALES: "erp_sales",
  PURCHASES: "erp_purchases",
  EXPENSES: "erp_expenses",
  SETTINGS: "erp_settings",
};

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  barcode: string;
  taxRate: number;       // per-product GST % (0 = use global)
  expiryDate: string;   // YYYY-MM-DD, empty = no expiry
}

export interface ShopSettings {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  taxNo: string;
  currency: string;
  globalTaxRate: number; // percentage e.g. 17
  invoicePrefix: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  outstanding: number;
  totalPurchases: number;
  joinDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  outstanding: number;
  totalPurchases: number;
  joinDate: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  discount: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  change: number;
  paymentMethod: string;
  date: string;
  status: "paid" | "partial" | "credit";
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  date: string;
  status: "paid" | "partial" | "pending";
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  note: string;
}

const sampleProducts: Product[] = [
  { id: "1", name: "Basmati Rice 5kg", sku: "GRC001", category: "Grocery", buyPrice: 450, sellPrice: 550, stock: 120, minStock: 20, unit: "Bag", barcode: "8901234567890", taxRate: 0, expiryDate: "2027-06-30" },
  { id: "2", name: "Cooking Oil 1L", sku: "GRC002", category: "Grocery", buyPrice: 180, sellPrice: 220, stock: 85, minStock: 30, unit: "Bottle", barcode: "8901234567891", taxRate: 0, expiryDate: "2026-12-31" },
  { id: "3", name: "Sugar 1kg", sku: "GRC003", category: "Grocery", buyPrice: 85, sellPrice: 110, stock: 200, minStock: 50, unit: "Packet", barcode: "8901234567892", taxRate: 0, expiryDate: "2027-03-15" },
  { id: "4", name: "Tea Leaves 250g", sku: "GRC004", category: "Grocery", buyPrice: 120, sellPrice: 160, stock: 8, minStock: 20, unit: "Box", barcode: "8901234567893", taxRate: 0, expiryDate: "2026-09-10" },
  { id: "5", name: "Paracetamol 500mg", sku: "MED001", category: "Medicine", buyPrice: 15, sellPrice: 25, stock: 500, minStock: 100, unit: "Strip", barcode: "8901234567894", taxRate: 0, expiryDate: "2026-08-30" },
  { id: "6", name: "Samsung Galaxy A54", sku: "MOB001", category: "Mobile", buyPrice: 35000, sellPrice: 42000, stock: 12, minStock: 3, unit: "Piece", barcode: "8901234567895", taxRate: 17, expiryDate: "" },
  { id: "7", name: "iPhone 14 Cover", sku: "MOB002", category: "Mobile", buyPrice: 150, sellPrice: 350, stock: 45, minStock: 10, unit: "Piece", barcode: "8901234567896", taxRate: 0, expiryDate: "" },
  { id: "8", name: "White Flour 10kg", sku: "GRC005", category: "Grocery", buyPrice: 650, sellPrice: 780, stock: 60, minStock: 15, unit: "Bag", barcode: "8901234567897", taxRate: 0, expiryDate: "2027-01-20" },
  { id: "9", name: "Denim Jeans Men", sku: "GAR001", category: "Garments", buyPrice: 800, sellPrice: 1500, stock: 30, minStock: 5, unit: "Piece", barcode: "8901234567898", taxRate: 0, expiryDate: "" },
  { id: "10", name: "Laptop HP 15", sku: "ELC001", category: "Electronics", buyPrice: 55000, sellPrice: 65000, stock: 5, minStock: 2, unit: "Piece", barcode: "8901234567899", taxRate: 17, expiryDate: "" },
  { id: "11", name: "PVC Pipe 1 inch", sku: "HWR001", category: "Hardware", buyPrice: 45, sellPrice: 65, stock: 150, minStock: 30, unit: "Piece", barcode: "8901234567900", taxRate: 0, expiryDate: "" },
  { id: "12", name: "Cement 50kg Bag", sku: "HWR002", category: "Hardware", buyPrice: 420, sellPrice: 500, stock: 3, minStock: 10, unit: "Bag", barcode: "8901234567901", taxRate: 0, expiryDate: "" },
  { id: "13", name: "Amoxicillin 250mg", sku: "MED002", category: "Medicine", buyPrice: 80, sellPrice: 130, stock: 200, minStock: 50, unit: "Strip", barcode: "8901234567902", taxRate: 0, expiryDate: "2026-09-05" },
];

const sampleCustomers: Customer[] = [
  { id: "1", name: "Ahmed Ali", phone: "03001234567", email: "ahmed@gmail.com", address: "House 12, Street 4, Lahore", creditLimit: 10000, outstanding: 2500, totalPurchases: 45000, joinDate: "2024-01-15" },
  { id: "2", name: "Fatima Khan", phone: "03111234567", email: "fatima@gmail.com", address: "Block C, DHA, Karachi", creditLimit: 20000, outstanding: 0, totalPurchases: 82000, joinDate: "2024-02-20" },
  { id: "3", name: "Muhammad Hassan", phone: "03211234567", email: "hassan@gmail.com", address: "Gulberg III, Lahore", creditLimit: 5000, outstanding: 1200, totalPurchases: 23000, joinDate: "2024-03-10" },
  { id: "4", name: "Sara Malik", phone: "03321234567", email: "sara@gmail.com", address: "F-8, Islamabad", creditLimit: 15000, outstanding: 0, totalPurchases: 67500, joinDate: "2024-01-05" },
  { id: "5", name: "Usman Raza", phone: "03421234567", email: "usman@gmail.com", address: "Model Town, Lahore", creditLimit: 8000, outstanding: 3800, totalPurchases: 31000, joinDate: "2024-04-12" },
  { id: "6", name: "Ayesha Noor", phone: "03031234567", email: "ayesha@gmail.com", address: "Clifton, Karachi", creditLimit: 25000, outstanding: 0, totalPurchases: 112000, joinDate: "2023-11-20" },
];

const sampleSuppliers: Supplier[] = [
  { id: "1", name: "Al-Noor Traders", phone: "04211234567", email: "alnoor@supplier.com", address: "Anarkali Bazar, Lahore", outstanding: 15000, totalPurchases: 450000, joinDate: "2023-06-01" },
  { id: "2", name: "Pak Pharma Ltd", phone: "02111234567", email: "pakpharma@supplier.com", address: "SITE, Karachi", outstanding: 0, totalPurchases: 280000, joinDate: "2023-08-15" },
  { id: "3", name: "Mobile World Dist.", phone: "03001234568", email: "mobileworld@dist.com", address: "Hall Road, Lahore", outstanding: 45000, totalPurchases: 820000, joinDate: "2023-05-20" },
  { id: "4", name: "Sunrise Electronics", phone: "03111234568", email: "sunrise@elec.com", address: "Saddar, Rawalpindi", outstanding: 0, totalPurchases: 380000, joinDate: "2023-09-10" },
];

const sampleSales: Sale[] = [
  { id: "1", invoiceNo: "INV-2026-001", customerId: "1", customerName: "Ahmed Ali", items: [{ productId: "1", productName: "Basmati Rice 5kg", qty: 2, price: 550, discount: 0 }, { productId: "3", productName: "Sugar 1kg", qty: 3, price: 110, discount: 0 }], subtotal: 1430, discount: 30, tax: 0, total: 1400, paid: 1400, change: 0, paymentMethod: "Cash", date: "2026-08-25", status: "paid" },
  { id: "2", invoiceNo: "INV-2026-002", customerId: "2", customerName: "Fatima Khan", items: [{ productId: "6", productName: "Samsung Galaxy A54", qty: 1, price: 42000, discount: 1000 }], subtotal: 42000, discount: 1000, tax: 0, total: 41000, paid: 41000, change: 0, paymentMethod: "Card", date: "2026-08-25", status: "paid" },
  { id: "3", invoiceNo: "INV-2026-003", customerId: "3", customerName: "Muhammad Hassan", items: [{ productId: "9", productName: "Denim Jeans Men", qty: 2, price: 1500, discount: 0 }], subtotal: 3000, discount: 0, tax: 0, total: 3000, paid: 1800, change: 0, paymentMethod: "Credit", date: "2026-08-24", status: "partial" },
  { id: "4", invoiceNo: "INV-2026-004", customerId: "4", customerName: "Sara Malik", items: [{ productId: "10", productName: "Laptop HP 15", qty: 1, price: 65000, discount: 2000 }], subtotal: 65000, discount: 2000, tax: 0, total: 63000, paid: 63000, change: 0, paymentMethod: "Transfer", date: "2026-08-24", status: "paid" },
  { id: "5", invoiceNo: "INV-2026-005", customerId: "5", customerName: "Usman Raza", items: [{ productId: "2", productName: "Cooking Oil 1L", qty: 5, price: 220, discount: 0 }, { productId: "8", productName: "White Flour 10kg", qty: 2, price: 780, discount: 0 }], subtotal: 2660, discount: 0, tax: 0, total: 2660, paid: 0, change: 0, paymentMethod: "Credit", date: "2026-08-23", status: "credit" },
];

const samplePurchases: Purchase[] = [
  { id: "1", invoiceNo: "PUR-2026-001", supplierId: "1", supplierName: "Al-Noor Traders", items: [{ productId: "1", productName: "Basmati Rice 5kg", qty: 50, price: 450 }, { productId: "3", productName: "Sugar 1kg", qty: 100, price: 85 }], subtotal: 30500, tax: 0, total: 30500, paid: 30500, date: "2026-08-20", status: "paid" },
  { id: "2", invoiceNo: "PUR-2026-002", supplierId: "3", supplierName: "Mobile World Dist.", items: [{ productId: "6", productName: "Samsung Galaxy A54", qty: 5, price: 35000 }], subtotal: 175000, tax: 0, total: 175000, paid: 130000, date: "2026-08-18", status: "partial" },
];

const sampleExpenses: Expense[] = [
  { id: "1", title: "Shop Rent", category: "Rent", amount: 25000, date: "2026-08-01", note: "Monthly rent for August" },
  { id: "2", title: "Electricity Bill", category: "Utilities", amount: 8500, date: "2026-08-05", note: "" },
  { id: "3", title: "Staff Salaries", category: "Salaries", amount: 45000, date: "2026-08-10", note: "3 employees" },
  { id: "4", title: "Packaging Material", category: "Supplies", amount: 3200, date: "2026-08-15", note: "Bags and boxes" },
  { id: "5", title: "Internet & Phone", category: "Utilities", amount: 2500, date: "2026-08-18", note: "" },
];

function initData<T>(key: string, defaults: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
}

export function getProducts(): Product[] { return initData(STORAGE_KEYS.PRODUCTS, sampleProducts); }
export function saveProducts(data: Product[]): void { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data)); }

export function getCustomers(): Customer[] { return initData(STORAGE_KEYS.CUSTOMERS, sampleCustomers); }
export function saveCustomers(data: Customer[]): void { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data)); }

export function getSuppliers(): Supplier[] { return initData(STORAGE_KEYS.SUPPLIERS, sampleSuppliers); }
export function saveSuppliers(data: Supplier[]): void { localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data)); }

export function getSales(): Sale[] { return initData(STORAGE_KEYS.SALES, sampleSales); }
export function saveSales(data: Sale[]): void { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data)); }

export function getPurchases(): Purchase[] { return initData(STORAGE_KEYS.PURCHASES, samplePurchases); }
export function savePurchases(data: Purchase[]): void { localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(data)); }

export function getExpenses(): Expense[] { return initData(STORAGE_KEYS.EXPENSES, sampleExpenses); }
export function saveExpenses(data: Expense[]): void { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data)); }

const defaultSettings: ShopSettings = {
  name: "SmartBiz Store", tagline: "Your Trusted Business Partner",
  phone: "03001234567", email: "info@smartbiz.pk",
  address: "Shop 15, Main Bazar, Lahore", taxNo: "NTN-1234567",
  currency: "PKR", globalTaxRate: 17, invoicePrefix: "INV",
};

export function getSettings(): ShopSettings {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) return defaultSettings;
  try { return { ...defaultSettings, ...JSON.parse(stored) }; } catch { return defaultSettings; }
}
export function saveSettings(data: ShopSettings): void { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data)); }

// Expiry helpers
export function getExpiryStatus(expiryDate: string): "none" | "ok" | "soon" | "expired" {
  if (!expiryDate) return "none";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate); exp.setHours(0, 0, 0, 0);
  const diff = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "expired";
  if (diff <= 30) return "soon";
  return "ok";
}

export function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
export function formatCurrency(amount: number): string { return "₨ " + amount.toLocaleString("en-PK"); }
export function formatDate(dateStr: string): string { return new Date(dateStr).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }); }
