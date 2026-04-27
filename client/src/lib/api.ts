const BASE = import.meta.env.VITE_STOREFRONT_BASE_URL ?? "/api/v1";
const API_KEY = import.meta.env.VITE_STOREFRONT_API_KEY ?? "";

function withLang(path: string, lang?: string) {
  if (!lang) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}lang=${encodeURIComponent(lang)}`;
}

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

export interface ProductVariant {
  id: number;
  name: string;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  sku: string | null;
  price: string | null;
  stock: number;
  imageUrl: string | null;
  colorHex: string | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  price: string;
  compareAtPrice?: string | null;
  imageUrls: string[];
  categoryId?: number | null;
  silhouetteId?: number | null;
  isActive: boolean;
  metadata?: Record<string, unknown> | null;
  variants?: ProductVariant[];
  hasVariants?: boolean;
  effectiveStock?: number;
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

export interface CombinationItem {
  productId: number;
  categoryId: number;
  variantId: number | null;
  productName: string | null;
  productPrice: string | null;
  productImage: string | null;
  categoryName: string | null;
  variantName: string | null;
  variantPrice: string | null;
  variantImage: string | null;
  variantColorHex: string | null;
  productFabric?: string | null;
}

export interface Combination {
  id: number;
  silhouetteId: number;
  slug: string;
  name: string;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  description: string | null;
  descriptionEN?: string | null;
  descriptionAR?: string | null;
  price: string;
  imageUrl: string | null;
  galleryUrls: string[];
  stock: number;
  inStock: boolean;
  items: CombinationItem[];
}

export interface CombinationDetail {
  kind: "combination";
  id: number;
  slug: string;
  silhouetteId: number;
  name: string;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  description: string | null | undefined;
  price: string;
  imageUrl: string | null;
  galleryUrls: string[];
  stock: number;
  inStock: boolean;
  items: CombinationItem[];
}

export interface OrderItem {
  productId?: number;
  combinationId?: number;
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
  /** "card" | "bank" — havale şablonu için */
  paymentMethod?: "card" | "bank";
  /** "shipping" | "store_pickup" */
  deliveryMethod?: "shipping" | "store_pickup";
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

  getProduct: (slug: string, lang?: "TR" | "EN" | "AR") =>
    storefrontFetch<{ data: Product }>(withLang(`/products/${encodeURIComponent(slug)}`, lang)),

  getCombination: (slug: string, lang?: "TR" | "EN" | "AR") =>
    storefrontFetch<{ data: CombinationDetail }>(
      withLang(`/combinations/${encodeURIComponent(slug)}`, lang),
    ),

  getCategories: () =>
    storefrontFetch<{ data: Category[] }>("/categories"),

  getCollections: () =>
    storefrontFetch<{ data: Collection[] }>("/collections"),

  getSilhouettes: () =>
    storefrontFetch<{ data: Silhouette[] }>("/silhouettes"),

  getCombinations: (params?: { silhouetteId?: number }) => {
    const query = new URLSearchParams();
    if (params?.silhouetteId != null) query.set("silhouetteId", String(params.silhouetteId));
    const qs = query.toString();
    return storefrontFetch<{ data: Combination[] }>(`/combinations${qs ? `?${qs}` : ""}`);
  },

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
