import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface OrderHistoryItem {
  productId?: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderHistoryEntry {
  orderNumber: string;
  status: string;
  total: number;
  shippingCost: number;
  subtotal: number;
  createdAt: number;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
  shippingCity?: string;
  paymentMethod?: "card" | "bank";
  items: OrderHistoryItem[];
}

interface OrdersContextType {
  orders: OrderHistoryEntry[];
  addOrder: (order: OrderHistoryEntry) => void;
  clearOrders: () => void;
  ordersCount: number;
}

const STORAGE_KEY = "voilee_orders";

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setOrders(parsed);
      }
    } catch (err) {
      console.error("Failed to read orders from storage", err);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.error("Failed to persist orders", err);
    }
  }, [orders, isLoaded]);

  const addOrder = useCallback((order: OrderHistoryEntry) => {
    setOrders((prev) => {
      if (prev.some((o) => o.orderNumber === order.orderNumber)) return prev;
      return [order, ...prev];
    });
  }, []);

  const clearOrders = useCallback(() => setOrders([]), []);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        clearOrders,
        ordersCount: orders.length,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
