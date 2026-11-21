"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  Lock,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

interface AuthPortalClientProps {
  initialMode?: "login" | "register";
}

export function AuthPortalClient({
  initialMode = "login",
}: AuthPortalClientProps) {
  const {
    currentUser,
    isHydrated,
    totalCartCount,
    totalWishlistCount,
    loginUser,
    registerUser,
    resetUserPassword,
    logoutUser,
  } = useStore();

  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback State
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setFormError("");
    setFormSuccess("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const emailTrimmed = loginEmail.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!loginPassword) {
      setFormError("Please enter your password.");
      return;
    }

    const res = loginUser({
      email: emailTrimmed,
      password: loginPassword,
      rememberMe,
    });

    if (!res.ok) {
      setFormError(res.error ?? "Unable to sign in. Please try again.");
      return;
    }

    setFormSuccess("Welcome back! You are now signed in.");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (fullName.trim().length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    if (
      !registerEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.trim())
    ) {
      setFormError("Please enter a valid email address.");
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (registerPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    if (registerPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setFormError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    const res = registerUser({
      fullName: fullName.trim(),
      email: registerEmail.trim(),
      mobile: mobile.trim(),
      password: registerPassword,
    });

    if (!res.ok) {
      setFormError(res.error ?? "Unable to create account.");
      return;
    }

    setFormSuccess("Account created successfully! Welcome to Liyana Naturals.");
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (
      !resetEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())
    ) {
      setResetError("Please enter your registered email address.");
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError("New password must be at least 6 characters long.");
      return;
    }

    const res = resetUserPassword({
      email: resetEmail.trim(),
      newPassword: resetNewPassword,
    });

    if (!res.ok) {
      setResetError(res.error ?? "Could not reset password.");
      return;
    }

    setLoginEmail(resetEmail.trim());
    setResetMessage("Password updated! You can now login with your new password.");
    setTimeout(() => {
      setIsForgotOpen(false);
      setResetNewPassword("");
      setResetMessage("");
    }, 1500);
  };

  const userInitials = currentUser?.fullName
    ? currentUser.fullName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "LN";

  return (
    <main className="relative min-h-[calc(100vh-120px)] w-full flex items-center justify-center py-4 px-3.5 sm:py-7 sm:px-6 overflow-hidden bg-gradient-to-br from-[#FBF7EE] via-[#F5EEDB] to-[#EAE0C8]">
      {/* Modern Pure-CSS & Vector Botanical Background (Zero Image Requests) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle Architectural Grid */}
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(38, 61, 24, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(38, 61, 24, 0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Soft Radial Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(251, 247, 238, 0.15) 0%, rgba(233, 220, 197, 0.48) 100%)",
          }}
        />

        {/* Ambient Botanical Mesh Orbs */}
        <div className="absolute -top-24 -left-20 w-64 h-64 sm:w-[400px] sm:h-[400px] rounded-full bg-[#A8B88A]/35 blur-[85px]" />
        <div className="absolute -bottom-24 -right-20 w-72 h-72 sm:w-[440px] sm:h-[440px] rounded-full bg-[#536B35]/18 blur-[95px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[540px] sm:h-[540px] rounded-full bg-[#FFFFFF]/45 blur-[90px]" />

        {/* Modern Geometric Botanical Rings & Leaf Linework */}
        <svg
          viewBox="0 0 420 420"
          fill="none"
          className="hidden sm:block absolute -top-16 -right-16 w-72 h-72 md:w-88 md:h-88 lg:w-[420px] lg:h-[420px] text-[#263D18]/[0.08]"
        >
          <circle cx="210" cy="210" r="185" stroke="currentColor" strokeWidth="1.2" />
          <circle
            cx="210"
            cy="210"
            r="142"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
          <path
            d="M210 55 C265 125 265 235 210 315 C155 235 155 125 210 55 Z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path d="M210 75 L210 300" stroke="currentColor" strokeWidth="1" />
        </svg>

        <svg
          viewBox="0 0 420 420"
          fill="none"
          className="hidden sm:block absolute -bottom-20 -left-20 w-72 h-72 md:w-88 md:h-88 lg:w-[420px] lg:h-[420px] text-[#536B35]/[0.1]"
        >
          <circle cx="210" cy="210" r="180" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="210" cy="210" r="128" stroke="currentColor" strokeWidth="0.9" />
          <path
            d="M115 280 C165 185 240 135 325 105 C295 190 225 265 115 280 Z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      </div>

      {/* Centered Compact Modern Auth Card */}
      <section
        aria-label={
          currentUser
            ? "My Account"
            : mode === "login"
            ? "Login to Liyana Naturals"
            : "Create Liyana Naturals Account"
        }
        className="relative z-10 w-full max-w-[440px] mx-auto rounded-[18px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(29,50,20,0.12)] border border-[#28321F]/10 ring-1 ring-[#263D18]/5 p-4 sm:p-6"
      >
        {/* Top Centered Brand Logo */}
        <div className="flex justify-center mb-2.5 sm:mb-3">
          <Logo size="sm" href="/" />
        </div>

        {/* Sleek Segmented Mode Switcher when logged out */}
        {(!isHydrated || !currentUser) && (
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[#FBF7EE] border border-[#28321F]/10 mb-3.5 sm:mb-4"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => switchMode("login")}
              className={cn(
                "py-1.5 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer",
                mode === "login"
                  ? "bg-[#263D18] text-[#FBF7EE] shadow-xs"
                  : "text-[#555C4A] hover:text-[#263D18]"
              )}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => switchMode("register")}
              className={cn(
                "py-1.5 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer",
                mode === "register"
                  ? "bg-[#263D18] text-[#FBF7EE] shadow-xs"
                  : "text-[#555C4A] hover:text-[#263D18]"
              )}
            >
              Register
            </button>
          </div>
        )}

        <div className="w-full">
          {isHydrated && currentUser ? (
            /* ================================================================ */
            /* SIGNED-IN ACCOUNT OVERVIEW                                       */
            /* ================================================================ */
            <div className="w-full text-center space-y-4 py-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1DF] text-[#263D18] text-[11px] font-semibold border border-[#A8B88A]/45">
                <Sparkles className="w-3.5 h-3.5 text-[#536B35]" />
                <span>Verified Liyana Member</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#263D18] text-[#FBF7EE] font-heading text-xl font-bold flex items-center justify-center shadow-md mb-2">
                  {userInitials}
                </div>
                <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#263D18] leading-tight">
                  Welcome, {currentUser.fullName}
                </h1>
                <p className="font-sans text-xs text-[#777968] mt-0.5">
                  {currentUser.email}
                  {currentUser.mobile ? ` • ${currentUser.mobile}` : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-left">
                <Link
                  href="/shop"
                  className="p-3 rounded-xl bg-[#FBF7EE]/70 border border-[#28321F]/10 hover:border-[#536B35]/40 transition-colors flex items-center gap-2.5"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#EAF1DF] text-[#263D18] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-sans text-xs sm:text-sm font-bold text-[#263D18]">
                      {totalCartCount} in Bag
                    </p>
                    <p className="font-sans text-[11px] text-[#777968]">
                      Explore Shop
                    </p>
                  </div>
                </Link>

                <Link
                  href="/wishlist"
                  className="p-3 rounded-xl bg-[#FBF7EE]/70 border border-[#28321F]/10 hover:border-[#536B35]/40 transition-colors flex items-center gap-2.5"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#FFF5F2] text-[#C2652B] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-[#C2652B]" />
                  </span>
                  <div>
                    <p className="font-sans text-xs sm:text-sm font-bold text-[#263D18]">
                      {totalWishlistCount} Saved
                    </p>
                    <p className="font-sans text-[11px] text-[#777968]">
                      View Wishlist
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Link
                  href="/shop"
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    setFormSuccess("");
                  }}
                  className="py-2.5 px-4 rounded-full border border-[#28321F]/15 bg-white hover:bg-[#FFF5F2] text-[#28321F] hover:text-[#C2652B] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : mode === "login" ? (
            /* ================================================================ */
            /* COMPACT LOGIN VIEW ("Welcome Back")                              */
            /* ================================================================ */
            <div className="w-full">
              <div className="text-center mb-3.5">
                <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#263D18] tracking-tight leading-tight">
                  Welcome Back
                </h1>
                <p className="font-sans text-xs text-[#777968] mt-0.5 leading-snug">
                  Login to continue your natural skincare journey.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mb-3 px-3 py-2 rounded-xl bg-[#FFF5F2] border border-[#C2652B]/30 text-[#C2652B] text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div
                  role="status"
                  className="mb-3 px-3 py-2 rounded-xl bg-[#EAF1DF] border border-[#536B35]/30 text-[#263D18] text-xs font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#3C6E26] shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                {/* Email Address */}
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="Email Address"
                    aria-label="Email Address"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="Password"
                    aria-label="Password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={
                      showLoginPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#777968] hover:text-[#263D18] transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[#28321F]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <span
                      className={cn(
                        "w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors",
                        rememberMe
                          ? "bg-[#263D18] border-[#263D18] text-white"
                          : "bg-white border-[#28321F]/25"
                      )}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span className="font-medium">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(loginEmail);
                      setResetError("");
                      setResetMessage("");
                      setIsForgotOpen(true);
                    }}
                    className="font-semibold text-[#263D18] hover:text-[#536B35] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] font-sans text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Switch to Register */}
              <p className="text-center font-sans text-xs text-[#555C4A] mt-3.5">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-[#263D18] hover:text-[#536B35] underline underline-offset-4 cursor-pointer"
                >
                  Register Now
                </button>
              </p>
            </div>
          ) : (
            /* ================================================================ */
            /* COMPACT REGISTER VIEW ("Create Account")                         */
            /* ================================================================ */
            <div className="w-full">
              <div className="text-center mb-3">
                <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#263D18] tracking-tight leading-tight">
                  Create Account
                </h1>
                <p className="font-sans text-xs text-[#777968] mt-0.5 leading-snug">
                  Join Liyana Naturals for pure botanical skincare.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mb-2.5 px-3 py-2 rounded-xl bg-[#FFF5F2] border border-[#C2652B]/30 text-[#C2652B] text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-2">
                {/* Full Name */}
                <div className="relative">
                  <User className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="Full Name"
                    aria-label="Full Name"
                    autoComplete="name"
                    className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                  />
                </div>

                {/* Email & Mobile Side-by-Side on sm+ */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        if (formError) setFormError("");
                      }}
                      placeholder="Email Address"
                      aria-label="Email Address"
                      autoComplete="email"
                      className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        if (formError) setFormError("");
                      }}
                      placeholder="Mobile Number"
                      aria-label="Mobile Number"
                      autoComplete="tel"
                      className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password Side-by-Side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        if (formError) setFormError("");
                      }}
                      placeholder="Password"
                      aria-label="Password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      aria-label={
                        showRegisterPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#777968] hover:text-[#263D18] transition-colors cursor-pointer"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (formError) setFormError("");
                      }}
                      placeholder="Confirm Password"
                      aria-label="Confirm Password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-xl bg-[#FBF7EE]/55 border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#777968] hover:text-[#263D18] transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms & Privacy Checkbox */}
                <label className="flex items-center justify-center gap-2 pt-0.5 cursor-pointer text-[11px] text-[#555C4A] pt-2 pb-2">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="sr-only peer"
                  />
                  <span
                    className={cn(
                      "w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      agreeTerms
                        ? "bg-[#263D18] border-[#263D18] text-white"
                        : "bg-white border-[#28321F]/25"
                    )}
                  >
                    {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className="leading-snug">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-semibold text-[#263D18] underline underline-offset-2 hover:text-[#536B35]"
                    >
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-[#263D18] underline underline-offset-2 hover:text-[#536B35]"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 px-5 rounded-full bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] font-sans text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Switch to Login */}
              <p className="text-center font-sans text-xs text-[#555C4A] mt-3.5">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[#263D18] hover:text-[#536B35] underline underline-offset-4 cursor-pointer"
                >
                  Login Now
                </button>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FORGOT PASSWORD RESET MODAL                                          */}
      {/* ==================================================================== */}
      {isForgotOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1D3214]/65 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reset Password"
          onClick={() => setIsForgotOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#28321F]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#28321F]/10">
              <h2 className="font-heading text-2xl font-bold text-[#263D18]">
                Reset Password
              </h2>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                aria-label="Close password reset"
                className="p-1 text-[#777968] hover:text-[#28321F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3 pt-4">
              <p className="font-sans text-xs text-[#777968]">
                Enter your registered email and set a new password.
              </p>

              {resetError && (
                <p className="text-xs font-medium text-[#C2652B]">
                  {resetError}
                </p>
              )}
              {resetMessage && (
                <p className="text-xs font-semibold text-[#3C6E26]">
                  {resetMessage}
                </p>
              )}

              <div className="relative">
                <Mail className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Registered Email Address"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FBF7EE] border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] focus:outline-none focus:border-[#536B35]"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="New Password (min 6 characters)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FBF7EE] border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] focus:outline-none focus:border-[#536B35]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-full bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
