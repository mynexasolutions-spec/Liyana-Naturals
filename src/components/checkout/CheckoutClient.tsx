"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Headphones,
  Home,
  Lock,
  Mail,
  Map,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useStore } from "@/context/StoreContext";
import {
  calculateOrderTotals,
  codFeeOf,
  freeShippingOffer,
  type PaymentSettings,
} from "@/lib/checkout/pricing";
import type { CouponRule } from "@/lib/coupons/shared";
import { itemLabel } from "@/lib/products/variants";
import { openRazorpayCheckout, type RazorpaySuccess } from "@/lib/razorpay/checkout-client";
import { cn } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

type PaymentOption = "online" | "cod";
type PaymentState = "cod" | "paid" | "processing" | "needs_attention";

// Shorter than the server's stock reservation, so a payment window never
// outlives the order it pays for.
const PAYMENT_WINDOW_SECONDS = 15 * 60;

interface PlacedOrder {
  orderNumber: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  razorpay?: { keyId: string; orderId: string; amount: number; currency: string };
}

interface CompletedOrderSnapshot {
  orderId: string;
  placedAt: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  paymentMethod: PaymentOption;
  paymentState: PaymentState;
  items: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    imageSrc: string;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

export function CheckoutClient({ payment }: { payment: PaymentSettings }) {
  const {
    isHydrated,
    currentUser,
    cartLines: detailedCartItems,
    totalCartCount,
    cartSubtotal,
    openCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    shippingSettings,
    contact,
  } = useStore();

  // Shipping Address State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Payment State
  const [chosenPayment, setPaymentMethod] = useState<PaymentOption>("online");
  // A choice the store has switched off falls back to one that is available.
  const paymentMethod: PaymentOption = !payment.onlineEnabled
    ? "cod"
    : !payment.codEnabled
      ? "online"
      : chosenPayment;
  const canPay = payment.onlineEnabled || payment.codEnabled;

  // An unpaid online order is reused on retry instead of creating another one.
  const pendingPayment = useRef<{
    fingerprint: string;
    createdAt: number;
    order: PlacedOrder;
  } | null>(null);

  // Coupon State
  const [isCouponOpen, setIsCouponOpen] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRule | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [offers, setOffers] = useState<CouponRule[]>([]);

  // Validation & Completed Order State
  const [formError, setFormError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] =
    useState<CompletedOrderSnapshot | null>(null);

  // Prefill from logged-in user once hydrated (without overwriting user edits)
  useEffect(() => {
    if (!isHydrated || !currentUser) return;
    const timer = window.setTimeout(() => {
      setFullName((prev) => prev || currentUser.fullName || "");
      setEmail((prev) => prev || currentUser.email || "");
      setPhone((prev) => prev || currentUser.mobile || "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isHydrated, currentUser]);

  // Offers the admin chose to show here.
  useEffect(() => {
    let stopped = false;
    fetch("/api/coupons", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { coupons?: CouponRule[] } | null) => {
        if (!stopped && result?.coupons) setOffers(result.coupons);
      })
      .catch(() => {
        // Checkout works without the offer list.
      });
    return () => {
      stopped = true;
    };
  }, []);

  // Same calculation the order API uses
  const shippingOffer = freeShippingOffer(shippingSettings);
  const {
    discount: discountAmount,
    shipping: shippingFee,
    codFee,
    total: grandTotal,
  } = calculateOrderTotals({
    subtotal: cartSubtotal,
    coupon: appliedCoupon,
    shipping: shippingSettings,
    codFee: paymentMethod === "cod" ? payment.codFee : 0,
  });
  // How much more the cart needs before the applied coupon counts again.
  const couponShortfall = appliedCoupon
    ? Math.max(0, Math.ceil(appliedCoupon.minSubtotal - cartSubtotal))
    : 0;

  const handleApplyCoupon = async (requested = couponInput) => {
    if (isCheckingCoupon) return;
    setCouponError("");
    const code = requested.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    if (cartSubtotal <= 0) {
      setCouponError("Add a product to your cart first.");
      return;
    }
    setIsCheckingCoupon(true);
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cartSubtotal }),
      });
      const result = await response.json();
      if (!response.ok) {
        setCouponError(result.error ?? "This coupon code is not valid.");
        return;
      }
      setAppliedCoupon(result.coupon);
      setCouponInput("");
    } catch {
      setCouponError("The coupon could not be checked. Please try again.");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (detailedCartItems.length === 0) {
      setFormError(
        "Your cart is empty. Please add at least one product before placing an order."
      );
      return;
    }

    if (!canPay) {
      setFormError("Orders cannot be placed right now. Please contact us.");
      return;
    }

    if (fullName.trim().length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (address.trim().length < 6) {
      setFormError("Please enter your complete delivery street address.");
      return;
    }
    if (city.trim().length < 2) {
      setFormError("Please enter your city.");
      return;
    }
    if (!stateName) {
      setFormError("Please select your state.");
      return;
    }
    if (!/^\d{6}$/.test(pinCode.trim())) {
      setFormError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const payload = {
      customer: { fullName, email, phone },
      address: { street: address, city, state: stateName, pinCode },
      items: detailedCartItems.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
      paymentMethod,
      couponCode: discountAmount > 0 ? appliedCoupon!.code : "",
      expectedTotal: grandTotal,
    };
    const fingerprint = JSON.stringify(payload);
    const details = {
      placedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      customerName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: stateName,
      pinCode: pinCode.trim(),
      paymentMethod,
      items: detailedCartItems.map(({ key, product, variant, unitPrice, quantity, image }) => ({
        id: key,
        name: itemLabel(product.name, variant?.name),
        category: product.category,
        price: unitPrice,
        quantity,
        imageSrc: image || "/images/products/Fresh_Green.webp",
      })),
    };

    const finishOrder = (order: PlacedOrder, paymentState: PaymentState) => {
      pendingPayment.current = null;
      setCompletedOrder({
        ...details,
        orderId: order.orderNumber,
        paymentState,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shipping,
        total: order.total,
      });
      clearCart();
      setIsPlacingOrder(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const showError = (error: unknown) => {
      setFormError(error instanceof Error ? error.message : "Unable to place your order.");
      setIsPlacingOrder(false);
      // The message sits at the top of the form, away from the pay button.
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const verifyPayment = async (order: PlacedOrder, payment: RazorpaySuccess) => {
      try {
        const response = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payment),
        });
        const result = await response.json();
        if (response.status === 400) {
          showError(
            new Error(
              `${result.error} If money was deducted, contact us with order #${order.orderNumber}.`
            )
          );
          return;
        }
        finishOrder(
          order,
          result.status === "paid" || result.status === "needs_attention"
            ? result.status
            : "processing"
        );
      } catch {
        // Money may already have moved; the webhook confirms it. Do not ask to pay again.
        finishOrder(order, "processing");
      }
    };

    setIsPlacingOrder(true);
    try {
      const pending = pendingPayment.current;
      const reusable =
        pending &&
        pending.fingerprint === fingerprint &&
        Date.now() - pending.createdAt < PAYMENT_WINDOW_SECONDS * 1000
          ? pending
          : null;
      const createdAt = reusable?.createdAt ?? Date.now();
      let order = reusable?.order;

      if (!order) {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: fingerprint,
        });
        const result = await response.json();
        if (!response.ok) {
          if (result.couponRejected) {
            setAppliedCoupon(null);
            setCouponError(result.error);
          }
          throw new Error(result.error ?? "Unable to place your order.");
        }
        order = result as PlacedOrder;
      }

      const placed = order;
      const razorpay = placed.razorpay;
      if (!razorpay) {
        finishOrder(placed, "cod");
        return;
      }
      pendingPayment.current = { fingerprint, createdAt, order: placed };

      let paymentReceived = false;
      await openRazorpayCheckout({
        key: razorpay.keyId,
        order_id: razorpay.orderId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: siteConfig.name,
        description: `Order #${placed.orderNumber}`,
        image: `${window.location.origin}/images/logo/logo.png`,
        prefill: { name: details.customerName, email: details.email, contact: details.phone },
        theme: { color: "#263D18" },
        timeout: Math.max(
          60,
          PAYMENT_WINDOW_SECONDS - Math.floor((Date.now() - createdAt) / 1000)
        ),
        handler: (payment) => {
          paymentReceived = true;
          void verifyPayment(placed, payment);
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (paymentReceived) return;
            showError(
              new Error(
                "Payment was not completed. Your cart is saved; press the pay button to try again."
              )
            );
          },
        },
      });
    } catch (orderError) {
      showError(orderError);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#FBF7EE] text-[#28321F] py-5 sm:py-7 lg:py-9 overflow-x-clip">
      {/* Subtle Pure-CSS Botanical Background Accents */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#A8B88A]/20 blur-[90px]" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full bg-[#E9DCC5]/55 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        {/* ================================================================== */}
        {/* TOP BREADCRUMB + 3-STEP CHECKOUT PROGRESS BAR                      */}
        {/* ================================================================== */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#28321F]/10 shadow-soft px-3.5 py-2.5 sm:px-5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-[#777968] font-medium"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[#555C4A] hover:text-[#263D18] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-[#777968]/70" />
            <button
              type="button"
              onClick={openCart}
              className="text-[#555C4A] hover:text-[#263D18] transition-colors cursor-pointer"
            >
              Cart
            </button>
            <ChevronRight className="w-3 h-3 text-[#777968]/70" />
            <span className="text-[#263D18] font-semibold">
              {completedOrder ? "Order Complete" : "Checkout"}
            </span>
          </nav>

          {/* 3-Step Indicator */}
          <ol
            aria-label="Checkout progress"
            className="flex items-center justify-between sm:justify-center md:justify-end gap-2 sm:gap-3"
          >
            {/* Step 1: Cart */}
            <li className="flex items-center gap-1.5 text-xs font-semibold text-[#263D18]">
              <span className="w-6 h-6 rounded-full bg-[#EAF1DF] border border-[#536B35]/35 text-[#263D18] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[2.6]" />
              </span>
              <span>Cart</span>
            </li>

            <span className="w-6 sm:w-10 h-px bg-[#28321F]/20" aria-hidden="true" />

            {/* Step 2: Checkout */}
            <li className="flex items-center gap-1.5 text-xs font-semibold">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 transition-colors",
                  completedOrder
                    ? "bg-[#EAF1DF] text-[#263D18] border border-[#536B35]/35"
                    : "bg-[#263D18] text-[#FBF7EE] shadow-2xs"
                )}
              >
                {completedOrder ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.6]" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                <span>Checkout</span>
              </span>
            </li>

            <span className="w-6 sm:w-10 h-px bg-[#28321F]/20" aria-hidden="true" />

            {/* Step 3: Order Complete */}
            <li className="flex items-center gap-1.5 text-xs font-semibold">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 transition-colors",
                  completedOrder
                    ? "bg-[#263D18] text-[#FBF7EE] shadow-2xs"
                    : "bg-[#FBF7EE] text-[#777968] border border-[#28321F]/15"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Order Complete</span>
                <span className="sm:hidden">Complete</span>
              </span>
            </li>
          </ol>
        </div>

        {/* ================================================================== */}
        {/* ORDER COMPLETE VIEW                                                */}
        {/* ================================================================== */}
        {completedOrder ? (
          <section
            aria-label="Order Confirmation"
            className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#28321F]/10 shadow-card p-5 sm:p-8"
          >
            <div className="text-center pb-6 border-b border-[#28321F]/10">
              <div className="w-14 h-14 rounded-full bg-[#EAF1DF] text-[#263D18] flex items-center justify-center mx-auto mb-3 border border-[#A8B88A]/50">
                <CheckCircle2 className="w-7 h-7 text-[#3C6E26]" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1DF] text-[#263D18] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#536B35]" />
                {completedOrder.paymentState === "processing"
                  ? "Payment Processing"
                  : completedOrder.paymentState === "needs_attention"
                  ? "Payment Received"
                  : "Order Confirmed"}{" "}
                • #{completedOrder.orderId}
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#263D18] tracking-tight">
                Thank You, {completedOrder.customerName}!
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#777968] mt-1.5 max-w-md mx-auto">
                Your pure botanical ritual order has been placed on{" "}
                {completedOrder.placedAt}.{" "}
                {completedOrder.paymentState === "processing"
                  ? "We are confirming your payment. Please do not pay again; the confirmation will be emailed to "
                  : completedOrder.paymentState === "needs_attention"
                  ? "Our team needs to check this order and will contact you. Details will be emailed to "
                  : "A confirmation email is on its way to "}
                <strong className="text-[#28321F]">{completedOrder.email}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-[#28321F]/10 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-[#FBF7EE]/75 border border-[#28321F]/8 space-y-1">
                <p className="font-semibold text-[#263D18] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#536B35]" />
                  <span>Delivery Address</span>
                </p>
                <p className="text-[#555C4A] leading-relaxed">
                  {completedOrder.customerName}
                  <br />
                  {completedOrder.address}
                  <br />
                  {completedOrder.city}, {completedOrder.state} -{" "}
                  {completedOrder.pinCode}
                  <br />
                  Phone: {completedOrder.phone}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBF7EE]/75 border border-[#28321F]/8 space-y-2">
                <p className="font-semibold text-[#263D18] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#536B35]" />
                  <span>Delivery &amp; Payment</span>
                </p>
                <p className="text-[#555C4A]">
                  <strong>Shipping:</strong>{" "}
                  {completedOrder.shippingFee === 0 ? "Free" : `₹${completedOrder.shippingFee}`}
                </p>
                <p className="text-[#555C4A]">
                  <strong>Payment:</strong>{" "}
                  {completedOrder.paymentState === "cod"
                    ? "Cash on Delivery (COD)"
                    : completedOrder.paymentState === "processing"
                    ? "Online (confirmation pending)"
                    : "Paid online"}
                </p>
              </div>
            </div>

            <div className="py-5 space-y-3 border-b border-[#28321F]/10">
              <h2 className="font-heading text-xl font-bold text-[#263D18]">
                Ordered Products ({completedOrder.items.length})
              </h2>
              <div className="space-y-2.5">
                {completedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FBF7EE]/60 border border-[#28321F]/8"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg bg-white border border-[#28321F]/10 shrink-0 overflow-hidden">
                        <Image
                          src={item.imageSrc}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-xs sm:text-sm font-bold text-[#263D18] truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#777968]">
                          {item.category} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-sans text-sm font-bold text-[#263D18] shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#777968]">Total Amount</p>
                <p className="font-sans text-2xl font-bold text-[#263D18]">
                  ₹{completedOrder.total}
                </p>
                {codFeeOf({ ...completedOrder, shipping: completedOrder.shippingFee }) > 0 && (
                  <p className="text-[11px] text-[#777968]">
                    Includes ₹{codFeeOf({ ...completedOrder, shipping: completedOrder.shippingFee })} Cash on Delivery fee
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-4 rounded-xl border border-[#28321F]/15 bg-white hover:bg-[#FBF7EE] text-[#263D18] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Print Receipt
                </button>
                <Link
                  href="/shop"
                  className="py-2.5 px-5 rounded-xl bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold inline-flex items-center transition-colors"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* ================================================================ */
          /* MAIN 2-COLUMN CHECKOUT FORM + ORDER SUMMARY                      */
          /* ================================================================ */
          <form
            onSubmit={handlePlaceOrder}
            noValidate
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"
          >
            {/* LEFT COLUMN: 1. Shipping + 2. Payment */}
            <div className="lg:col-span-7 space-y-5">
              {/* ------------------------------------------------------------ */}
              {/* 1. SHIPPING ADDRESS CARD                                     */}
              {/* ------------------------------------------------------------ */}
              <section
                aria-label="Shipping Address"
                className="bg-white rounded-2xl border border-[#28321F]/10 shadow-card p-4 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 pb-4 mb-4 border-b border-[#28321F]/8">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#EAF1DF] text-[#263D18] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] leading-tight">
                        1. Shipping Address
                      </h1>
                      <p className="font-sans text-xs text-[#777968]">
                        Enter your delivery address
                      </p>
                    </div>
                  </div>

                  {isHydrated && currentUser ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DF] text-[#263D18] text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3C6E26]" />
                      <span>Signed in: {currentUser.fullName}</span>
                    </span>
                  ) : (
                    <p className="font-sans text-xs text-[#777968]">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-semibold text-[#263D18] hover:text-[#536B35] underline underline-offset-4"
                      >
                        Sign In
                      </Link>
                    </p>
                  )}
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="mb-4 px-3.5 py-2.5 rounded-xl bg-[#FFF5F2] border border-[#C2652B]/35 text-[#C2652B] text-xs font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Full Name, Phone, Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="checkout-name"
                        className="block font-sans text-xs font-semibold text-[#28321F] mb-1.5"
                      >
                        Full Name <span className="text-[#C2652B]">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formError) setFormError("");
                          }}
                          placeholder="John Doe"
                          autoComplete="name"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-phone"
                        className="block font-sans text-xs font-semibold text-[#28321F] mb-1.5"
                      >
                        Phone Number <span className="text-[#C2652B]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (formError) setFormError("");
                          }}
                          placeholder="9876543210"
                          autoComplete="tel"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-email"
                        className="block font-sans text-xs font-semibold text-[#28321F] mb-1.5"
                      >
                        Email Address <span className="text-[#C2652B]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formError) setFormError("");
                          }}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full Street Address */}
                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block font-sans text-xs font-semibold text-[#28321F] mb-1.5"
                    >
                      Address <span className="text-[#C2652B]">*</span>
                    </label>
                    <div className="relative">
                      <Home className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="checkout-address"
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (formError) setFormError("");
                        }}
                        placeholder="House no., Building, Street, Area, Landmark"
                        autoComplete="street-address"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* City, State, PIN Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="block font-sans text-xs font-semibold text-[#28321F] mb-1.5"
                      >
                        City <span className="text-[#C2652B]">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-city"
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (formError) setFormError("");
                          }}
                          placeholder="Enter city"
                          autoComplete="address-level2"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-state"
                        className="block font-sans text-xs font-semibold text-[#28321F] mb-1.5"
                      >
                        State <span className="text-[#C2652B]">*</span>
                      </label>
                      <div className="relative">
                        <Map className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          id="checkout-state"
                          value={stateName}
                          onChange={(e) => {
                            setStateName(e.target.value);
                            if (formError) setFormError("");
                          }}
                          autoComplete="address-level1"
                          className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all cursor-pointer"
                        >
                          <option value="">Enter state</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#536B35] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-pin"
                        className="block font-sans text-xs font-semibold text-[#28321F] mb-1.5"
                      >
                        PIN Code <span className="text-[#C2652B]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-pin"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={pinCode}
                          onChange={(e) => {
                            setPinCode(e.target.value.replace(/\D/g, ""));
                            if (formError) setFormError("");
                          }}
                          placeholder="6 digit PIN code"
                          autoComplete="postal-code"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ------------------------------------------------------------ */}
              {/* 2. PAYMENT METHOD CARD                                       */}
              {/* ------------------------------------------------------------ */}
              <section
                aria-label="Payment Method"
                className="bg-white rounded-2xl border border-[#28321F]/10 shadow-card p-4 sm:p-6"
              >
                <div className="flex items-start gap-3 pb-4 mb-4 border-b border-[#28321F]/8">
                  <span className="w-9 h-9 rounded-xl bg-[#EAF1DF] text-[#263D18] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] leading-tight">
                      2. Payment Method
                    </h2>
                    <p className="font-sans text-xs text-[#777968]">
                      Choose your preferred payment method
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {!canPay && (
                    <p role="alert" className="rounded-xl border border-[#C2652B]/30 bg-[#FFF5F2] px-3.5 py-3 text-xs sm:text-sm font-medium text-[#C2652B]">
                      Orders cannot be placed right now. Please contact us.
                    </p>
                  )}

                  {/* Option 1: Online payment via Razorpay */}
                  {payment.onlineEnabled && (
                  <div
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      paymentMethod === "online"
                        ? "bg-[#EAF1DF]/40 border-[#263D18]"
                        : "bg-white border-[#28321F]/12 hover:border-[#536B35]/40"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      aria-pressed={paymentMethod === "online"}
                      className="w-full p-3.5 flex flex-wrap items-center justify-between gap-2 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            paymentMethod === "online"
                              ? "border-[#263D18]"
                              : "border-[#777968]/50"
                          )}
                        >
                          {paymentMethod === "online" && (
                            <span className="w-2 h-2 rounded-full bg-[#263D18]" />
                          )}
                        </span>
                        <Wallet className="w-4 h-4 text-[#263D18] shrink-0" />
                        <span className="font-sans text-xs sm:text-sm font-semibold text-[#263D18]">
                          Pay Online (UPI, Cards, Net Banking)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-[#FBF7EE] border border-[#28321F]/15 text-[10px] font-bold text-[#263D18]">
                          Razorpay
                        </span>
                      </div>
                    </button>
                  </div>
                  )}

                  {/* Option 2: Cash on Delivery (COD) */}
                  {payment.codEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={cn(
                      "w-full p-3.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer",
                      paymentMethod === "cod"
                        ? "bg-[#EAF1DF]/40 border-[#263D18]"
                        : "bg-white border-[#28321F]/12 hover:border-[#536B35]/40"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                          paymentMethod === "cod"
                            ? "border-[#263D18]"
                            : "border-[#777968]/50"
                        )}
                      >
                        {paymentMethod === "cod" && (
                          <span className="w-2 h-2 rounded-full bg-[#263D18]" />
                        )}
                      </span>
                      <ShoppingBag className="w-4 h-4 text-[#263D18] shrink-0" />
                      <span className="font-sans text-xs sm:text-sm font-semibold text-[#263D18]">
                        Cash on Delivery (COD)
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded bg-[#FBF7EE] border border-[#28321F]/15 text-[11px] font-bold text-[#263D18] shrink-0">
                      {payment.codFee > 0 ? `+₹${payment.codFee} fee` : "COD"}
                    </span>
                  </button>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Order Summary + Trust Grid + Place Order CTA */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              {/* ------------------------------------------------------------ */}
              {/* ORDER SUMMARY CARD                                           */}
              {/* ------------------------------------------------------------ */}
              <section
                aria-label="Order Summary"
                className="bg-white rounded-2xl border border-[#28321F]/10 shadow-card p-4 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-[#28321F]/8">
                  <div className="flex items-start gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-[#EAF1DF] text-[#263D18] flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] leading-tight">
                        Order Summary
                      </h2>
                      <p className="font-sans text-xs text-[#777968]">
                        {totalCartCount}{" "}
                        {totalCartCount === 1 ? "item" : "items"} in your cart
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openCart}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#536B35] hover:text-[#263D18] transition-colors cursor-pointer shrink-0"
                  >
                    <span>Edit Cart</span>
                  </button>
                </div>

                {/* Real Cart Products List (Working Qty + Remove) */}
                {detailedCartItems.length > 0 ? (
                  <div className="space-y-3 pb-4 mb-4 border-b border-[#28321F]/10 max-h-[300px] overflow-y-auto scrollbar-thin pr-0.5">
                    {detailedCartItems.map(({ key, product, variant, variantId, quantity, lineTotal, image }) => (
                      <div
                        key={key}
                        className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FBF7EE]/65 border border-[#28321F]/8"
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          className="relative w-14 h-14 rounded-lg bg-white border border-[#28321F]/10 shrink-0 overflow-hidden"
                        >
                          <Image
                            src={image || "/images/products/Fresh_Green.webp"}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                            unoptimized
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className="font-sans text-xs sm:text-sm font-bold text-[#263D18] hover:text-[#536B35] truncate"
                            >
                              {product.name}
                            </Link>
                            <span className="font-sans text-xs sm:text-sm font-bold text-[#263D18] shrink-0">
                              ₹{lineTotal}
                            </span>
                          </div>

                          <p className="font-sans text-[11px] text-[#777968] truncate">
                            {product.category}
                            {variant ? ` • Size: ${variant.name}` : ""}
                          </p>

                          <div className="flex items-center justify-between gap-2 mt-2">
                            <div className="inline-flex items-center rounded-lg border border-[#28321F]/15 bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(product.id, quantity - 1, variantId)
                                }
                                aria-label={`Decrease ${product.name} quantity`}
                                className="w-7 h-7 flex items-center justify-center text-[#263D18] hover:bg-[#EAF1DF] cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-[#28321F]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(product.id, quantity + 1, variantId)
                                }
                                aria-label={`Increase ${product.name} quantity`}
                                className="w-7 h-7 flex items-center justify-center text-[#263D18] hover:bg-[#EAF1DF] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id, variantId)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C2652B] hover:underline cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-5 px-4 mb-4 rounded-xl bg-[#FBF7EE] border border-[#28321F]/10 text-center space-y-3">
                    <p className="font-sans text-xs sm:text-sm font-semibold text-[#263D18]">
                      Your bag is currently empty
                    </p>
                    <p className="font-sans text-xs text-[#777968]">
                      Browse our botanical collection to add products to your bag.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Link
                        href="/shop"
                        className="px-4 py-2 rounded-lg bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs font-semibold transition-colors"
                      >
                        Browse Shop
                      </Link>
                    </div>
                  </div>
                )}

                {/* Subtotal / Discount / Shipping */}
                <div className="space-y-2 text-xs sm:text-sm mb-3.5">
                  <div className="flex items-center justify-between text-[#555C4A]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#28321F]">
                      ₹{cartSubtotal}
                    </span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[#3C6E26]">
                      <span className="inline-flex items-center gap-1.5">
                        <span>Coupon ({appliedCoupon.code})</span>
                        <button
                          type="button"
                          onClick={() => setAppliedCoupon(null)}
                          className="text-[11px] underline text-[#C2652B] cursor-pointer"
                        >
                          Remove
                        </button>
                      </span>
                      <span className="font-semibold">
                        -₹{discountAmount}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[#555C4A]">
                    <span>Shipping</span>
                    {shippingFee === 0 ? (
                      <span className="px-2 py-0.5 rounded bg-[#EAF1DF] text-[#263D18] text-[11px] font-bold">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-[#28321F]">
                        ₹{shippingFee}
                      </span>
                    )}
                  </div>

                  {codFee > 0 && (
                    <div className="flex items-center justify-between text-[#555C4A]">
                      <span>Cash on Delivery fee</span>
                      <span className="font-semibold text-[#28321F]">₹{codFee}</span>
                    </div>
                  )}
                </div>

                {/* Highlighted Total Box */}
                <div className="flex items-center justify-between rounded-xl bg-[#EAF1DF]/80 border border-[#A8B88A]/45 px-4 py-3 mb-4">
                  <div>
                    <p className="font-sans text-sm sm:text-base font-bold text-[#263D18]">
                      Total
                    </p>
                    <p className="font-sans text-[11px] text-[#555C4A]">
                      Inclusive of all taxes
                    </p>
                  </div>
                  <span className="font-sans text-xl sm:text-2xl font-bold text-[#263D18]">
                    ₹{grandTotal}
                  </span>
                </div>

                {/* Expandable Coupon Code Box */}
                <div className="rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]/65 p-3">
                  <button
                    type="button"
                    onClick={() => setIsCouponOpen((prev) => !prev)}
                    aria-expanded={isCouponOpen}
                    className="w-full flex items-center justify-between text-xs font-semibold text-[#263D18] cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#536B35]" />
                      <span>Have a coupon code?</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#536B35] transition-transform",
                        isCouponOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isCouponOpen && (
                    <div className="pt-2.5 space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            if (couponError) setCouponError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleApplyCoupon();
                            }
                          }}
                          placeholder="Enter coupon code"
                          aria-label="Coupon code"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white border border-[#28321F]/15 text-xs text-[#28321F] placeholder:text-[#777968] focus:outline-none focus:border-[#536B35]"
                        />
                        <button
                          type="button"
                          onClick={() => void handleApplyCoupon()}
                          disabled={isCheckingCoupon}
                          className="px-4 py-2 rounded-lg bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                        >
                          {isCheckingCoupon ? "Checking…" : "Apply"}
                        </button>
                      </div>
                      {appliedCoupon && couponShortfall > 0 && (
                        <p className="text-[11px] font-medium text-[#C2652B]">
                          Add ₹{couponShortfall} more to use {appliedCoupon.code}.{" "}
                          <button
                            type="button"
                            onClick={() => setAppliedCoupon(null)}
                            className="underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </p>
                      )}
                      {offers.some((offer) => offer.code !== appliedCoupon?.code) && (
                        <ul className="space-y-1.5 pt-1">
                          {offers
                            .filter((offer) => offer.code !== appliedCoupon?.code)
                            .map((offer) => (
                              <li
                                key={offer.code}
                                className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-[#536B35]/35 bg-white px-3 py-2"
                              >
                                <span className="min-w-0 text-[11px] text-[#555C4A]">
                                  <strong className="font-bold text-[#263D18]">{offer.code}</strong>{" "}
                                  {offer.label}
                                  {offer.minSubtotal > 0 && ` · on orders from ₹${offer.minSubtotal}`}
                                </span>
                                <button
                                  type="button"
                                  disabled={isCheckingCoupon}
                                  onClick={() => void handleApplyCoupon(offer.code)}
                                  className="shrink-0 text-[11px] font-bold uppercase text-[#536B35] hover:text-[#263D18] cursor-pointer"
                                >
                                  Apply
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                      {couponError && (
                        <p className="text-[11px] font-medium text-[#C2652B]">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* PLACE ORDER CTA CARD                                         */}
              {/* ------------------------------------------------------------ */}
              <div className="bg-white rounded-2xl border border-[#28321F]/10 shadow-card p-4 space-y-2.5 text-center">
                <button
                  type="submit"
                  disabled={isPlacingOrder || !canPay}
                  className="relative w-full py-3.5 px-6 rounded-xl bg-[#263D18] hover:bg-[#1D3214] disabled:opacity-60 disabled:cursor-wait text-[#FBF7EE] font-sans text-sm sm:text-base font-semibold inline-flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <ShieldCheck className="absolute left-5 w-4 h-4" />
                  <span>
                    {isPlacingOrder
                      ? "Please wait…"
                      : paymentMethod === "online"
                      ? `Pay ₹${grandTotal} Securely`
                      : "Place Order"}
                  </span>
                </button>
                <p className="font-sans text-[11px] text-[#777968] inline-flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#536B35]" />
                  <span>Secure and encrypted checkout</span>
                </p>
              </div>

              {/* TRUST BADGES ROW                                             */}
              {/* ------------------------------------------------------------ */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 items-stretch">
                <div className="bg-white rounded-xl border border-[#28321F]/10 p-3 sm:p-3.5 h-full flex flex-col items-center justify-start text-center gap-1.5 shadow-2xs">
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF1DF] flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#263D18] stroke-[1.8]" />
                  </span>
                  <p className="font-sans text-xs sm:text-[12.5px] font-bold text-[#263D18] leading-tight">
                    {shippingOffer ? "Free Shipping" : "Delivery"}
                  </p>
                  <p className="font-sans text-[10.5px] sm:text-[11px] text-[#777968] leading-snug">
                    {!shippingOffer
                      ? "Across India"
                      : shippingSettings.standardFee === 0 || shippingSettings.freeFrom === 0
                      ? "On all orders"
                      : `On orders above ₹${shippingSettings.freeFrom}`}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-[#28321F]/10 p-3 sm:p-3.5 h-full flex flex-col items-center justify-start text-center gap-1.5 shadow-2xs">
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF1DF] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#263D18] stroke-[1.8]" />
                  </span>
                  <p className="font-sans text-xs sm:text-[12.5px] font-bold text-[#263D18] leading-tight">
                    Secure Payment
                  </p>
                  <p className="font-sans text-[10.5px] sm:text-[11px] text-[#777968] leading-snug">
                    100% safe &amp; secure
                  </p>
                </div>

                {(contact.email || contact.phone) && (
                  <div className="bg-white rounded-xl border border-[#28321F]/10 p-3 sm:p-3.5 h-full flex flex-col items-center justify-start text-center gap-1.5 shadow-2xs min-w-0">
                    <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF1DF] flex items-center justify-center shrink-0">
                      <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#263D18] stroke-[1.8]" />
                    </span>
                    <p className="font-sans text-xs sm:text-[12.5px] font-bold text-[#263D18] leading-tight">
                      Need Help?
                    </p>
                    <p className="font-sans text-[10.5px] sm:text-[11px] text-[#777968] truncate max-w-full leading-snug">
                      {contact.email || contact.phone}
                    </p>
                  </div>
                )}
              </div>

             
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
