import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressContextType {
  addresses: SavedAddress[];
  defaultAddress: SavedAddress | null;
  addAddress: (addr: Omit<SavedAddress, "id">) => SavedAddress;
  updateAddress: (id: string, addr: Partial<Omit<SavedAddress, "id">>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "voilee_addresses";

export const emptyAddress: Omit<SavedAddress, "id" | "isDefault"> = {
  label: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  postalCode: "",
  country: "Türkiye",
};

function generateId() {
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function load(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // Migrate from old single-address format
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    // Old object format → wrap
    if (parsed && typeof parsed === "object" && parsed.address) {
      return [{ id: generateId(), label: "Ev", isDefault: true, ...parsed }];
    }
    return [];
  } catch {
    return [];
  }
}

function persist(list: SavedAddress[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAddresses(load());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) persist(addresses);
  }, [addresses, isLoaded]);

  const addAddress = useCallback((addr: Omit<SavedAddress, "id">): SavedAddress => {
    const newAddr: SavedAddress = { ...addr, id: generateId() };
    setAddresses((prev) => {
      // If first address or marked as default → demote others
      const updated = addr.isDefault
        ? prev.map((a) => ({ ...a, isDefault: false }))
        : prev;
      const result = [...updated, newAddr];
      // Ensure at least one default
      if (!result.some((a) => a.isDefault)) result[result.length - 1].isDefault = true;
      return result;
    });
    return newAddr;
  }, []);

  const updateAddress = useCallback((id: string, fields: Partial<Omit<SavedAddress, "id">>) => {
    setAddresses((prev) => {
      let updated = prev.map((a) =>
        a.id === id ? { ...a, ...fields } : a
      );
      // If we just set this one as default, demote others
      if (fields.isDefault) {
        updated = updated.map((a) =>
          a.id === id ? a : { ...a, isDefault: false }
        );
      }
      // Ensure at least one default
      if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      // If removed was default and others remain, promote first
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  }, []);

  const setDefault = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setAddresses([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddress,
        addAddress,
        updateAddress,
        removeAddress,
        setDefault,
        clearAll,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export function useAddress() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddress must be used within AddressProvider");
  return ctx;
}
