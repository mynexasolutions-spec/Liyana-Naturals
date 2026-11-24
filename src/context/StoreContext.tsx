"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AuthUser, Product } from "@/types";

export interface CartEntry {
  productId: string;
  quantity: number;
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
  passwordRecovery: boolean;
  catalogProducts: Product[];
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
  }) => Promise<AuthActionResult>;
  registerUser: (input: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<AuthActionResult>;
  loginWithGoogle: (input: {
    fullName: string;
    email: string;
  }) => Promise<AuthActionResult>;
  resetUserPassword: (input: {
    email: string;
    newPassword: string;
  }) => Promise<AuthActionResult>;
  updateUserPassword: (newPassword: string) => Promise<AuthActionResult>;
  logoutUser: () => Promise<void>;
}

const CART_STORAGE_KEY = "liyana_naturals_cart_v1";
const WISHLIST_STORAGE_KEY = "liyana_naturals_wishlist_v1";

function toAuthUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    fullName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email?.split("@")[0] ?? "Liyana member",
    email: user.email ?? "",
    mobile:
      typeof user.user_metadata?.phone === "string"
        ? user.user_metadata.phone
        : user.phone ?? undefined,
    provider: user.app_metadata?.provider === "google" ? "google" : "email",
    createdAt: user.created_at,
  };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  children,
  products = [],
}: {
  children: React.ReactNode;
  products?: Product[];
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted state cleanly on client mount
  useEffect(() => {
    let mounted = true;

    async function hydrate() {
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

        const { data, error } = await supabase.auth.getUser();
        if (mounted && !error) setCurrentUser(data.user ? toAuthUser(data.user) : null);
      } catch {
        // Keep cart and wishlist usable when authentication is unavailable.
      } finally {
        if (mounted) setHydrated(true);
      }
    }

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user ? toAuthUser(session.user) : null);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      if (event === "SIGNED_OUT") setPasswordRecovery(false);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

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
    async (input: {
      fullName: string;
      email: string;
      mobile: string;
      password: string;
    }): Promise<AuthActionResult> => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: input.password,
        options: { data: { full_name: input.fullName.trim(), phone: input.mobile.trim() } },
      });
      if (error) return { ok: false, error: error.message };
      const publicUser = data.user ? toAuthUser(data.user) : undefined;
      if (publicUser) setCurrentUser(publicUser);
      return { ok: true, user: publicUser };
    },
    [supabase]
  );

  const loginUser = useCallback(
    async (input: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }): Promise<AuthActionResult> => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: input.password,
      });
      if (error) return { ok: false, error: error.message };
      const publicUser = toAuthUser(data.user);
      setCurrentUser(publicUser);
      return { ok: true, user: publicUser };
    },
    [supabase]
  );

  const loginWithGoogle = useCallback(
    async (input: { fullName: string; email: string }): Promise<AuthActionResult> => {
      void input;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/login` },
      });
      return error ? { ok: false, error: error.message } : { ok: true };
    },
    [supabase]
  );

  const resetUserPassword = useCallback(
    async (input: { email: string; newPassword: string }): Promise<AuthActionResult> => {
      const normalizedEmail = input.email.trim().toLowerCase();
      void input.newPassword;
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      return error
        ? { ok: false, error: error.message }
        : { ok: true };
    },
    [supabase]
  );

  const updateUserPassword = useCallback(async (newPassword: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    setPasswordRecovery(false);
    return { ok: true };
  }, [supabase]);

  const logoutUser = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setPasswordRecovery(false);
  }, [supabase]);

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
      passwordRecovery,
      catalogProducts: products,
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
      updateUserPassword,
      logoutUser,
    }),
    [
      hydrated,
      passwordRecovery,
      products,
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
      updateUserPassword,
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
