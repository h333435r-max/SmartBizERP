// Mock Auth System
export type UserRole = "admin" | "manager" | "staff";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  businessName?: string;
}

export const MOCK_USERS: (AuthUser & { password: string })[] = [
  { id: "1", name: "Admin User", email: "admin@smartbiz.pk", password: "admin123", role: "admin", avatar: "A" },
  { id: "2", name: "Raza Manager", email: "manager@smartbiz.pk", password: "manager123", role: "manager", avatar: "R" },
  { id: "3", name: "Ali Staff", email: "staff@smartbiz.pk", password: "staff123", role: "staff", avatar: "S" },
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ["/dashboard", "/pos", "/products", "/inventory", "/sales", "/purchases", "/customers", "/suppliers", "/expenses", "/reports", "/settings", "/credit", "/daily-report"],
  manager: ["/dashboard", "/pos", "/products", "/inventory", "/sales", "/purchases", "/customers", "/suppliers", "/expenses", "/reports", "/credit", "/daily-report"],
  staff: ["/pos"],
};

const AUTH_KEY = "erp_auth_user";
const USERS_KEY = "erp_registered_users";

function getAllUsers(): (AuthUser & { password: string })[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const extra = stored ? JSON.parse(stored) : [];
    return [...MOCK_USERS, ...extra];
  } catch { return MOCK_USERS; }
}

export function getCurrentUser(): AuthUser | null {
  const stored = sessionStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

export function login(email: string, password: string): AuthUser | null {
  const users = getAllUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) return null;
  const { password: _, ...user } = found;
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function register(data: RegisterData): { success: boolean; error?: string } {
  const users = getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) return { success: false, error: "Email already registered" };
  if (data.password.length < 6) return { success: false, error: "Password must be at least 6 characters" };

  const newUser: AuthUser & { password: string } = {
    id: Date.now().toString(36),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    avatar: data.name.charAt(0).toUpperCase(),
  };

  // Save to localStorage (only extra users, not mock ones)
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const extra = stored ? JSON.parse(stored) : [];
    localStorage.setItem(USERS_KEY, JSON.stringify([...extra, newUser]));
  } catch { return { success: false, error: "Failed to save user" }; }

  // Auto-login
  const { password: _, ...user } = newUser;
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return { success: true };
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

export function hasAccess(role: UserRole, path: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(path) ?? false;
}
