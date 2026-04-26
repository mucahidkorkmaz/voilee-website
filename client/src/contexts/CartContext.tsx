import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

const CART_SESSION_KEY = "voilee_cart_session_id";
const ABANDONED_SYNC_MS = 900;

function getOrCreateCartSessionId(): string {
  try {
    const existing = localStorage.getItem(CART_SESSION_KEY);
    if (existing && existing.length >= 8) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, id);
    return id;
  } catch {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function buildCartLineId(input: {
  id: number;
  combinationId?: number | null;
  variantId?: number | null;
}): string {
  if (input.combinationId != null) return `c:${input.combinationId}`;
  if (input.variantId != null) return `p:${input.id}:v:${input.variantId}`;
  return `p:${input.id}`;
}

export interface CartItem {
  lineId: string;
  id: number;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  price: number;
  quantity: number;
  collection: string;
  imageUrl?: string;
  combinationId?: number;
  variantId?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "lineId"> & { lineId?: string }) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCartItem(raw: CartItem): CartItem {
  const lineId = raw.lineId ?? buildCartLineId(raw);
  return { ...raw, lineId };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncAbandoned = trpc.cart.syncAbandoned.useMutation();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const flushAbandonedSync = useCallback(
    (items: CartItem[], total: number) => {
      const sid = sessionIdRef.current;
      if (!sid || authLoading) return;
      syncAbandoned.mutate({
        sessionId: sid,
        items,
        cartTotal: total,
      });
    },
    [authLoading, syncAbandoned],
  );

  useEffect(() => {
    sessionIdRef.current = getOrCreateCartSessionId();
    const savedCart = localStorage.getItem("voilee_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsed)) {
          setCartItems(parsed.map(normalizeCartItem));
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("voilee_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded || authLoading) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
      flushAbandonedSync(cartItems, total);
    }, ABANDONED_SYNC_MS);
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [cartItems, isLoaded, authLoading, flushAbandonedSync]);

  const addToCart = (item: Omit<CartItem, "lineId"> & { lineId?: string }) => {
    const lineId = item.lineId ?? buildCartLineId(item);
    const full: CartItem = { ...item, lineId };
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.lineId === lineId);
      if (existingItem) {
        return prevItems.map(i =>
          i.lineId === lineId ? { ...i, quantity: i.quantity + full.quantity } : i,
        );
      }
      return [...prevItems, full];
    });
  };

  const removeFromCart = (lineId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.lineId !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => (item.lineId === lineId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    flushAbandonedSync([], 0);
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
