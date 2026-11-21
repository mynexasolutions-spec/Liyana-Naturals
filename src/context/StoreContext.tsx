"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products } from "@/data/products";
import { AuthUser } from "@/types";

export interface CartEntry {
  productId: string;
  quantity: number;
}

interface StoredAccount extends AuthUser {
  password?: string;
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
}

interface AddToCartOptions {
  openDrawer?: boolean;
}

interface StoreContextValue {
  isHydrated: boolean;
  currentUser: AuthUser | null;
  cartItems: CartEntry[];
  wishlistIds: string[];
  totalCartCount: number;
  totalWishlistCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (
    productId: string,
    quantity?: number,
    options?: AddToCartOptions
  ) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartItemQty: (productId: string) => number;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loginUser: (input: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => AuthActionResult;
  registerUser: (input: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }) => AuthActionResult;
  loginWithGoogle: (input: {
    fullName: string;
    email: string;
  }) => AuthActionResult;
  resetUserPassword: (input: {
    email: string;
    newPassword: string;
  }) => AuthActionResult;
  logoutUser: () => void;
}

const CART_STORAGE_KEY = "liyana_naturals_cart_v1";
const WISHLIST_STORAGE_KEY = "liyana_naturals_wishlist_v1";
const USERS_STORAGE_KEY = "liyana_naturals_users_v1";
const SESSION_STORAGE_KEY = "liyana_naturals_session_v1";

function toPublicUser(account: StoredAccount): AuthUser {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    mobile: account.mobile,
    provider: account.provider,
    createdAt: account.createdAt,
  };
}

function readStoredAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredAccounts(accounts: StoredAccount[]) {
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage write errors
  }
}

function persistSession(user: AuthUser, rememberMe = true) {
  try {
    const payload = JSON.stringify(user);
    if (rememberMe) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, payload);
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, payload);
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage write errors
  }
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted state cleanly on client mount
  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartEntry[];
        if (Array.isArray(parsed)) {
          setCartItems(
            parsed.filter(
              (item) =>
                item &&
                typeof item.productId === "string" &&
                typeof item.quantity === "number" &&
                item.quantity > 0
            )
          );
        }
      }

      const savedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist) as string[];
        if (Array.isArray(parsed)) {
          setWishlistIds(parsed.filter((id) => typeof id === "string"));
        }
      }

      const savedSession =
        window.localStorage.getItem(SESSION_STORAGE_KEY) ??
        window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession) as AuthUser;
        if (
          parsedUser &&
          typeof parsedUser.id === "string" &&
          typeof parsedUser.email === "string"
        ) {
          setCurrentUser(parsedUser);
        }
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist cart changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage write errors
    }
  }, [cartItems, hydrated]);

  // Persist wishlist changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistIds)
      );
    } catch {
      // Ignore storage write errors
    }
  }, [wishlistIds, hydrated]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addToCart = useCallback(
    (productId: string, quantity = 1, options?: AddToCartOptions) => {
      if (quantity <= 0) return;
      setCartItems((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { productId, quantity }];
      });
      if (options?.openDrawer !== false) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCartItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => item.productId !== productId);
        }
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartItemQty = useCallback(
    (productId: string) =>
      cartItems.find((item) => item.productId === productId)?.quantity ?? 0,
    [cartItems]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const registerUser = useCallback(
    (input: {
      fullName: string;
      email: string;
      mobile: string;
      password: string;
    }): AuthActionResult => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const accounts = readStoredAccounts();

      if (accounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)) {
        return {
          ok: false,
          error: "An account with this email already exists. Please login instead.",
        };
      }

      const newAccount: StoredAccount = {
        id: `user-${Date.now()}`,
        fullName: input.fullName.trim(),
        email: normalizedEmail,
        mobile: input.mobile.trim(),
        password: input.password,
        provider: "email",
        createdAt: new Date().toISOString(),
      };

      writeStoredAccounts([...accounts, newAccount]);
      const publicUser = toPublicUser(newAccount);
      setCurrentUser(publicUser);
      persistSession(publicUser, true);

      return { ok: true, user: publicUser };
    },
    []
  );

  const loginUser = useCallback(
    (input: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }): AuthActionResult => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const accounts = readStoredAccounts();
      const matched = accounts.find(
        (acc) => acc.email.toLowerCase() === normalizedEmail
      );

      if (!matched) {
        return {
          ok: false,
          error: "No account found with this email. Please register first.",
        };
      }

      if (matched.provider === "google" && !matched.password) {
        return {
          ok: false,
          error:
            "This email was registered via Google. Please continue with Google.",
        };
      }

      if (matched.password !== input.password) {
        return {
          ok: false,
          error: "Incorrect password. Please check and try again.",
        };
      }

      const publicUser = toPublicUser(matched);
      setCurrentUser(publicUser);
      persistSession(publicUser, input.rememberMe !== false);

      return { ok: true, user: publicUser };
    },
    []
  );

  const loginWithGoogle = useCallback(
    (input: { fullName: string; email: string }): AuthActionResult => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const accounts = readStoredAccounts();
      const existing = accounts.find(
        (acc) => acc.email.toLowerCase() === normalizedEmail
      );

      let targetAccount: StoredAccount;
      if (existing) {
        targetAccount = existing;
      } else {
        targetAccount = {
          id: `google-${Date.now()}`,
          fullName: input.fullName.trim(),
          email: normalizedEmail,
          provider: "google",
          createdAt: new Date().toISOString(),
        };
        writeStoredAccounts([...accounts, targetAccount]);
      }

      const publicUser = toPublicUser(targetAccount);
      setCurrentUser(publicUser);
      persistSession(publicUser, true);

      return { ok: true, user: publicUser };
    },
    []
  );

  const resetUserPassword = useCallback(
    (input: { email: string; newPassword: string }): AuthActionResult => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const accounts = readStoredAccounts();
      const index = accounts.findIndex(
        (acc) => acc.email.toLowerCase() === normalizedEmail
      );

      if (index === -1) {
        return {
          ok: false,
          error: "No account found with this email address.",
        };
      }

      const updated = accounts.map((acc, idx) =>
        idx === index
          ? { ...acc, password: input.newPassword, provider: "email" as const }
          : acc
      );
      writeStoredAccounts(updated);
      return { ok: true };
    },
    []
  );

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalWishlistCount = wishlistIds.length;

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce((sum, entry) => {
        const product = products.find((p) => p.id === entry.productId);
        return sum + (product ? product.price * entry.quantity : 0);
      }, 0),
    [cartItems]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      isHydrated: hydrated,
      currentUser,
      cartItems,
      wishlistIds,
      totalCartCount,
      totalWishlistCount,
      cartSubtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      getCartItemQty,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist,
      loginUser,
      registerUser,
      loginWithGoogle,
      resetUserPassword,
      logoutUser,
    }),
    [
      hydrated,
      currentUser,
      cartItems,
      wishlistIds,
      totalCartCount,
      totalWishlistCount,
      cartSubtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      getCartItemQty,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist,
      loginUser,
      registerUser,
      loginWithGoogle,
      resetUserPassword,
      logoutUser,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside a StoreProvider");
  }
  return ctx;
}
