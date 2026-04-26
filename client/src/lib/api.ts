const BASE = import.meta.env.VITE_STOREFRONT_BASE_URL ?? "/api/v1";
const API_KEY = import.meta.env.VITE_STOREFRONT_API_KEY ?? "";

async function storefrontFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data;
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/auth${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data;
}

export interface AuthUser {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: "user" | "admin";
  emailVerified: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  compareAtPrice?: string | null;
  imageUrls: string[];
  categoryId?: number | null;
  isActive: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Collection {
  id: number;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  slug: string;
  descriptionTR?: string | null;
  descriptionEN?: string | null;
  descriptionAR?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

export interface Silhouette {
  id: number;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  slug: string;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

export interface OrderItem {
  productId?: number;
  productName: string;
  quantity: number;
  price: string;
}

export interface CreateOrderPayload {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCountry?: string;
  notes?: string;
  items: OrderItem[];
}

export interface OrderResult {
  id: number;
  orderNumber: string;
  status: string;
  totalPrice: string;
}

export const api = {
  getProducts: (params?: {
    search?: string;
    categoryId?: number;
    collectionId?: number;
    silhouetteId?: number;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.categoryId != null) query.set("categoryId", String(params.categoryId));
    if (params?.collectionId != null) query.set("collectionId", String(params.collectionId));
    if (params?.silhouetteId != null) query.set("silhouetteId", String(params.silhouetteId));
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.offset != null) query.set("offset", String(params.offset));
    const qs = query.toString();
    return storefrontFetch<{ data: Product[] }>(`/products${qs ? `?${qs}` : ""}`);
  },

  getProduct: (slug: string) =>
    storefrontFetch<{ data: Product }>(`/products/${slug}`),

  getCategories: () =>
    storefrontFetch<{ data: Category[] }>("/categories"),

  getCollections: () =>
    storefrontFetch<{ data: Collection[] }>("/collections"),

  getSilhouettes: () =>
    storefrontFetch<{ data: Silhouette[] }>("/silhouettes"),

  createOrder: (payload: CreateOrderPayload) =>
    storefrontFetch<{ data: OrderResult }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getOrder: (orderNumber: string) =>
    storefrontFetch<{ data: OrderResult & { items: OrderItem[] } }>(`/orders/${orderNumber}`),

  auth: {
    me: () => authFetch<{ user: AuthUser | null }>("/me"),
    login: (payload: { email: string; password: string }) =>
      authFetch<{ user: AuthUser }>("/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    register: (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) =>
      authFetch<{ user: AuthUser }>("/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    logout: () => authFetch<{ success: true }>("/logout", { method: "POST" }),
    changePassword: (payload: { currentPassword: string; newPassword: string }) =>
      authFetch<{ success: true }>("/change-password", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateProfile: (payload: { name?: string; phone?: string | null }) =>
      authFetch<{ user: AuthUser }>("/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },
};
