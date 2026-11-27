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
import { DEFAULT_SHIPPING, type ShippingSettings } from "@/lib/checkout/pricing";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import {
  authEmailSchema,
  authPasswordSchema,
  firstValidationMessage,
  loginPasswordSchema,
  signupVerificationSchema,
} from "@/lib/auth/schema";
import { defaultVariant, findVariant, imagesFor } from "@/lib/products/variants";
import { EMPTY_CONTACT, type StoreContact } from "@/lib/settings/contact";
import type { AuthUser, Product, ProductVariant } from "@/types";

export interface CartEntry {
  productId: string;
  /** The chosen size, for a product that has sizes. */
  variantId?: string;
  quantity: number;
}

/** A cart entry with the product details needed to show it. */
export interface CartLine {
  key: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
  unitPrice: number;
  lineTotal: number;
  image?: string;
}

const isSameLine = (entry: CartEntry, productId: string, variantId?: string) =>
  entry.productId === productId && (entry.variantId ?? "") === (variantId ?? "");

/** Keeps a saved cart in step with the sizes the shop offers now. */
function reconcileCart(entries: CartEntry[], products: Product[]): CartEntry[] {
  const merged: CartEntry[] = [];
  for (const entry of entries) {
    const product = products.find((item) => item.id === entry.productId);
    let variantId = entry.variantId;
    if (product) {
      if (!product.variants?.length) variantId = undefined;
      else if (!variantId) variantId = defaultVariant(product)?.id;
      // Never swap in another size: the customer must choose it again.
      else if (!findVariant(product, variantId)) continue;
    }
    const existing = merged.find((item) => isSameLine(item, entry.productId, variantId));
    if (existing) existing.quantity += entry.quantity;
    else merged.push({ productId: entry.productId, ...(variantId ? { variantId } : {}), quantity: entry.quantity });
  }
  return merged;
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
  requiresEmailConfirmation?: boolean;
}

interface AddToCartOptions {
  openDrawer?: boolean;
  /** Left out, the product's starting size is added. */
  variantId?: string;
}

interface StoreContextValue {
  isHydrated: boolean;
  passwordRecovery: boolean;
  catalogProducts: Product[];
  shippingSettings: ShippingSettings;
  contact: StoreContact;
  currentUser: AuthUser | null;
  cartItems: CartEntry[];
  cartLines: CartLine[];
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
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  /** Without a size, counts every size of the product. */
  getCartItemQty: (productId: string, variantId?: string) => number;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loginUser: (input: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<AuthActionResult>;
  requestSignupOtp: (email: string) => Promise<AuthActionResult>;
  registerUser: (input: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    otp: string;
  }) => Promise<AuthActionResult>;
  loginWithGoogle: (input: {
    fullName: string;
    email: string;
  }) => Promise<AuthActionResult>;
  resetUserPassword: (input: {
    email: string;
  }) => Promise<AuthActionResult>;
  updateUserPassword: (newPassword: string) => Promise<AuthActionResult>;
  logoutUser: () => Promise<void>;
}

const CART_STORAGE_KEY = "liyana_naturals_cart_v1";
const WISHLIST_STORAGE_KEY = "liyana_naturals_wishlist_v1";

async function postAuthRequest(url: string, payload: unknown): Promise<AuthActionResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    return response.ok
      ? { ok: true }
      : { ok: false, error: result.error ?? "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}

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
  shipping = DEFAULT_SHIPPING,
  contact = EMPTY_CONTACT,
}: {
  children: React.ReactNode;
  products?: Product[];
  shipping?: ShippingSettings;
  contact?: StoreContact;
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
                  (item.variantId === undefined || typeof item.variantId === "string") &&
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
        if (mounted && !error) {
          setCurrentUser(data.user ? toAuthUser(data.user) : null);
          if (new URLSearchParams(window.location.search).get("reset") === "1") {
            setPasswordRecovery(true);
          }
        }
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

  useEffect(() => {
    if (!hydrated || products.length === 0) return;
    setCartItems((prev) => {
      const next = reconcileCart(prev, products);
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [hydrated, products]);

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
      const product = products.find((item) => item.id === productId);
      const variantId = product?.variants?.length
        ? (options?.variantId ?? defaultVariant(product)?.id)
        : undefined;
      setCartItems((prev) => {
        if (prev.some((item) => isSameLine(item, productId, variantId))) {
          return prev.map((item) =>
            isSameLine(item, productId, variantId)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { productId, ...(variantId ? { variantId } : {}), quantity }];
      });
      if (options?.openDrawer !== false) {
        setIsCartOpen(true);
      }
    },
    [products]
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      setCartItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => !isSameLine(item, productId, variantId));
        }
        return prev.map((item) =>
          isSameLine(item, productId, variantId) ? { ...item, quantity } : item
        );
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCartItems((prev) => prev.filter((item) => !isSameLine(item, productId, variantId)));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartItemQty = useCallback(
    (productId: string, variantId?: string) =>
      cartItems
        .filter((item) => (variantId ? isSameLine(item, productId, variantId) : item.productId === productId))
        .reduce((sum, item) => sum + item.quantity, 0),
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

  const requestSignupOtp = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const emailResult = authEmailSchema.safeParse(email.trim().toLowerCase());
      if (!emailResult.success) {
        return { ok: false, error: firstValidationMessage(emailResult.error) };
      }
      return postAuthRequest("/api/auth/otp", { email: emailResult.data });
    },
    []
  );

  const registerUser = useCallback(
    async (input: {
      fullName: string;
      email: string;
      mobile: string;
      password: string;
      otp: string;
    }): Promise<AuthActionResult> => {
      const parsed = signupVerificationSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: firstValidationMessage(parsed.error) };
      }

      const email = parsed.data.email.toLowerCase();
      const created = await postAuthRequest("/api/auth/register", { ...parsed.data, email });
      if (!created.ok) return created;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: parsed.data.password,
        });
        if (error) {
          return { ok: false, error: "Account created. Please log in." };
        }
        const publicUser = toAuthUser(data.user);
        setCurrentUser(publicUser);
        return { ok: true, user: publicUser };
      } catch {
        return { ok: false, error: "Account created. Please log in." };
      }
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
      const emailResult = authEmailSchema.safeParse(normalizedEmail);
      if (!emailResult.success) {
        return { ok: false, error: firstValidationMessage(emailResult.error) };
      }
      const passwordResult = loginPasswordSchema.safeParse(input.password);
      if (!passwordResult.success) {
        return { ok: false, error: firstValidationMessage(passwordResult.error) };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailResult.data,
          password: passwordResult.data,
        });
        if (error) return { ok: false, error: getAuthErrorMessage(error, "login") };
        const publicUser = toAuthUser(data.user);
        setCurrentUser(publicUser);
        return { ok: true, user: publicUser };
      } catch (error) {
        return { ok: false, error: getAuthErrorMessage(error, "login") };
      }
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
      return error
        ? { ok: false, error: getAuthErrorMessage(error, "login") }
        : { ok: true };
    },
    [supabase]
  );

  const resetUserPassword = useCallback(
    async (input: { email: string }): Promise<AuthActionResult> => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const emailResult = authEmailSchema.safeParse(normalizedEmail);
      if (!emailResult.success) {
        return { ok: false, error: firstValidationMessage(emailResult.error) };
      }

      try {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", "/login");
        const { error } = await supabase.auth.resetPasswordForEmail(
          emailResult.data,
          { redirectTo: callbackUrl.toString() },
        );
        return error
          ? { ok: false, error: getAuthErrorMessage(error, "reset") }
          : { ok: true };
      } catch (error) {
        return { ok: false, error: getAuthErrorMessage(error, "reset") };
      }
    },
    [supabase]
  );

  const updateUserPassword = useCallback(async (newPassword: string): Promise<AuthActionResult> => {
    const passwordResult = authPasswordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      return { ok: false, error: firstValidationMessage(passwordResult.error) };
    }

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        return {
          ok: false,
          error: "This password reset link is invalid or has expired. Request a new one.",
        };
      }

      const { error } = await supabase.auth.updateUser({ password: passwordResult.data });
      if (error) return { ok: false, error: getAuthErrorMessage(error, "password") };
      setPasswordRecovery(false);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getAuthErrorMessage(error, "password") };
    }
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

  const cartLines = useMemo(
    () =>
      cartItems.flatMap((entry): CartLine[] => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product) return [];
        const variant = findVariant(product, entry.variantId);
        // A size that no longer matches is corrected by the effect above.
        if (product.variants?.length && !variant) return [];
        const unitPrice = variant?.price ?? product.price;
        return [{
          key: `${entry.productId}:${entry.variantId ?? ""}`,
          productId: entry.productId,
          variantId: entry.variantId,
          quantity: entry.quantity,
          product,
          variant,
          unitPrice,
          lineTotal: unitPrice * entry.quantity,
          image: imagesFor(product, variant)[0]?.src,
        }];
      }),
    [cartItems, products]
  );

  const cartSubtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartLines]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      isHydrated: hydrated,
      passwordRecovery,
      catalogProducts: products,
      shippingSettings: shipping,
      contact,
      currentUser,
      cartItems,
      cartLines,
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
      requestSignupOtp,
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
      shipping,
      contact,
      currentUser,
      cartItems,
      cartLines,
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
      requestSignupOtp,
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
