"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BadgeCheck, CheckCircle2, CreditCard, Megaphone, Share2, Store, Truck, type LucideIcon } from "lucide-react";
import { BadgeListEditor } from "@/components/admin/BadgeListEditor";
import { Switch } from "@/components/admin/kit";
import { sendAdminRequest } from "@/components/admin/orders/post-admin";
import type { Badge } from "@/lib/content/badges";
import { toShippingSettings } from "@/lib/checkout/pricing";
import { announcementMessages } from "@/lib/settings/announcement";
import { storeSettingsSchema } from "@/lib/settings/schema";

export type SettingsFormValues = {
  store_name: string;
  support_email: string;
  support_phone: string;
  address: string;
  support_hours: string;
  social_instagram: string;
  social_facebook: string;
  social_youtube: string;
  social_pinterest: string;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_second: string;
  shipping_fee: string;
  free_shipping_threshold: string;
  online_payment_enabled: boolean;
  cod_enabled: boolean;
  cod_fee: string;
  product_badges: Badge[];
};

type TextKey = Exclude<
  keyof SettingsFormValues,
  "announcement_enabled" | "product_badges" | "online_payment_enabled" | "cod_enabled"
>;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#28321F]/12 bg-white px-3.5 py-2.5 text-sm text-[#28321F] outline-none placeholder:text-[#A4A79A] focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 rounded-2xl border border-[#28321F]/8 bg-white p-5 md:p-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF1DF] text-[#263D18]">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="font-serif text-xl text-[#263D18]">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#777968]">{description}</p>
        </div>
      </div>
      <div className="grid min-w-0 content-start gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isDirty = JSON.stringify(values) !== JSON.stringify(saved);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const set = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
    setMessage("");
  };

  const field = (
    key: TextKey,
    label: string,
    options: { type?: string; placeholder?: string; wide?: boolean; hint?: string; prefix?: string } = {},
  ) => (
    <label className={`block min-w-0 text-sm font-medium text-[#28321F] ${options.wide ? "sm:col-span-2" : ""}`}>
      {label}
      <span className="relative block">
        {options.prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-sm text-[#777968]">
            {options.prefix}
          </span>
        )}
        <input
          type={options.type ?? "text"}
          {...(options.type === "number" ? { min: 0, step: "0.01" } : {})}
          value={values[key]}
          placeholder={options.placeholder}
          onChange={(event) => set(key, event.target.value)}
          className={`${inputClass} ${options.prefix ? "pl-8" : ""}`}
        />
      </span>
      {options.hint && <span className="mt-1 block text-xs font-normal text-[#777968]">{options.hint}</span>}
    </label>
  );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const toNumber = (value: string) => (value.trim() === "" ? Number.NaN : Number(value));
    const payload = {
      ...values,
      // A badge with no words is simply dropped.
      product_badges: values.product_badges.filter((badge) => badge.label.trim()),
      shipping_fee: toNumber(values.shipping_fee),
      free_shipping_threshold:
        values.free_shipping_threshold.trim() === "" ? null : Number(values.free_shipping_threshold),
      cod_fee: values.cod_fee.trim() === "" ? 0 : Number(values.cod_fee),
    };
    const checked = storeSettingsSchema.safeParse(payload);
    if (!checked.success) {
      setError(checked.error.issues[0]?.message ?? "Check the settings.");
      return;
    }

    setSaving(true);
    const result = await sendAdminRequest("/api/admin/settings", payload, "PATCH");
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const stored = { ...values, product_badges: payload.product_badges };
    setValues(stored);
    setSaved(stored);
    setMessage("Settings saved.");
    router.refresh();
  };

  const shipping = toShippingSettings({
    shipping_fee: values.shipping_fee.trim() === "" ? null : values.shipping_fee,
    free_shipping_threshold:
      values.free_shipping_threshold.trim() === "" ? null : values.free_shipping_threshold,
  });
  const paymentSwitch = (key: "online_payment_enabled" | "cod_enabled", title: string, description: string) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]/70 px-3.5 py-3 sm:col-span-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#28321F]">{title}</p>
        <p className="text-xs text-[#777968]">{description}</p>
      </div>
      <Switch checked={values[key]} label={values[key] ? "On" : "Off"} onChange={() => set(key, !values[key])} />
    </div>
  );
  const announcement = announcementMessages({
    ownMessageOn: values.announcement_enabled,
    ownMessage: values.announcement_text,
    secondMessage: values.announcement_second,
    shipping,
  });
  const preview = [announcement.first, announcement.second, values.support_phone.trim()].filter(Boolean);

  return (
    <form onSubmit={save} noValidate className="w-full space-y-5">
      <header>
        <p className="text-sm text-[#777968]">Store management</p>
        <h1 className="font-serif text-3xl text-[#263D18]">Settings</h1>
      </header>

      <Section
        icon={Store}
        title="Store details"
        description="Contact details shown across the website and in emails. An empty field is hidden."
      >
        {field("store_name", "Store name", { wide: true })}
        {field("support_email", "Support email", { type: "email", placeholder: "info@example.com" })}
        {field("support_phone", "Support phone", { type: "tel", placeholder: "+91 98765 43210" })}
        {field("support_hours", "Support hours", { wide: true, placeholder: "Mon – Sat, 10:00 AM – 7:00 PM" })}
        <label className="block text-sm font-medium text-[#28321F] sm:col-span-2">
          Address
          <textarea
            rows={3}
            value={values.address}
            onChange={(event) => set("address", event.target.value)}
            className={inputClass}
          />
        </label>
      </Section>

      <Section
        icon={Share2}
        title="Social media"
        description="The links behind the social icons on the website. Leave a field empty to hide that icon."
      >
        {field("social_instagram", "Instagram", { type: "url", wide: true, placeholder: "https://instagram.com/yourpage" })}
        {field("social_facebook", "Facebook", { type: "url", wide: true, placeholder: "https://facebook.com/yourpage" })}
        {field("social_youtube", "YouTube", { type: "url", wide: true, placeholder: "https://youtube.com/@yourchannel" })}
        {field("social_pinterest", "Pinterest", { type: "url", wide: true, placeholder: "https://pinterest.com/yourpage" })}
      </Section>

      <Section
        icon={Megaphone}
        title="Announcement bar"
        description="The green strip at the top of the website, the same on phones and computers. Your support phone is added at the end."
      >
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]/70 px-3.5 py-3 sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-[#28321F]">Show my own message</p>
            <p className="text-xs text-[#777968]">When off, the free shipping message is shown (if you offer free delivery).</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values.announcement_enabled}
            aria-label="Show my own announcement"
            onClick={() => set("announcement_enabled", !values.announcement_enabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${values.announcement_enabled ? "bg-[#3C6E26]" : "bg-[#CFCFC4]"}`}
          >
            <span
              className={`absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform ${values.announcement_enabled ? "translate-x-5" : ""}`}
            />
          </button>
        </div>
        {field("announcement_text", "Message", {
          wide: true,
          placeholder: "Free Shipping on orders above ₹999",
          hint: `${values.announcement_text.length}/120 characters`,
        })}
        {field("announcement_second", "Second message", {
          wide: true,
          placeholder: "100% Natural & Safe",
          hint: `${values.announcement_second.length}/60 characters. Leave empty to hide it.`,
        })}
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-xs font-medium text-[#777968]">Preview</p>
          {preview.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 break-words rounded-lg bg-[#263D18] px-5 py-2.5 text-xs tracking-wide text-[#FBF7EE]">
              {preview.map((text, index) => (
                <span key={index} className="min-w-0">{text}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#777968]">Nothing to show, so the strip is hidden.</p>
          )}
        </div>
      </Section>

      <Section icon={Truck} title="Shipping" description="What customers pay for delivery at checkout.">
        {field("shipping_fee", "Shipping fee", { type: "number", prefix: "₹", hint: "0 makes delivery free for everyone." })}
        {field("free_shipping_threshold", "Free shipping from", { type: "number", prefix: "₹", hint: "Leave empty to never give free delivery." })}
        <p className="rounded-xl bg-[#FBF7EE] px-3.5 py-2.5 text-sm text-[#28321F] sm:col-span-2">
          {shipping.standardFee === 0 || shipping.freeFrom === 0
            ? "Delivery is free on every order."
            : shipping.freeFrom === null
            ? `Delivery costs ₹${shipping.standardFee} on every order.`
            : `Delivery costs ₹${shipping.standardFee}, and is free for orders of ₹${shipping.freeFrom} or more.`}
        </p>
      </Section>

      <Section icon={CreditCard} title="Payments" description="How customers can pay at checkout.">
        {paymentSwitch("online_payment_enabled", "Online payment", "UPI, cards and net banking through Razorpay.")}
        {paymentSwitch("cod_enabled", "Cash on Delivery", "The customer pays when the parcel arrives.")}
        {field("cod_fee", "Cash on Delivery fee", { type: "number", prefix: "₹", wide: true, hint: "Added to Cash on Delivery orders. 0 for no extra charge." })}
        {!values.online_payment_enabled && !values.cod_enabled && (
          <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900 sm:col-span-2">
            Both ways of paying are off, so customers cannot place orders.
          </p>
        )}
      </Section>

      <Section
        icon={BadgeCheck}
        title="Product page badges"
        description="Shown under the buy buttons on every product, next to the free shipping message. Only add promises the store keeps."
      >
        <div className="min-w-0 sm:col-span-2">
          <BadgeListEditor
            items={values.product_badges}
            onChange={(items) => set("product_badges", items)}
            placeholder="Secure Payment"
            addLabel="Add badge"
          />
        </div>
      </Section>

      {/* Floats over the page only while there is something to save or report. */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#28321F]/10 bg-white px-4 py-3 ${
          isDirty || error || message ? "sticky bottom-3 z-20 shadow-[0_8px_30px_rgba(38,61,24,0.18)]" : ""
        }`}
      >
        <p
          role={error ? "alert" : "status"}
          className={`flex min-w-0 items-center gap-2 text-sm font-medium ${error ? "text-red-600" : message ? "text-[#3C6E26]" : "text-[#777968]"}`}
        >
          {error ? <AlertCircle className="size-4 shrink-0" /> : message ? <CheckCircle2 className="size-4 shrink-0" /> : null}
          {error || message || (isDirty ? "You have unsaved changes." : "All changes are saved.")}
        </p>
        <div className="ml-auto flex gap-2.5">
          <button
            type="button"
            disabled={!isDirty || saving}
            onClick={() => {
              setValues(saved);
              setError("");
              setMessage("");
            }}
            className="h-11 rounded-full border border-[#28321F]/12 px-5 text-sm disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="h-11 rounded-full bg-[#263D18] px-6 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
