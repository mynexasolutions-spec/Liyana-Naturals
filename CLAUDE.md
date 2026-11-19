# CLAUDE.md — Liyana Naturals Development Guide

## Project Overview
Liyana Naturals is a luxury natural & botanical cosmetics e-commerce platform built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v3.4.x.

## Commands
- **Dev Server:** `npm run dev`
- **Lint:** `npm run lint` (ESLint 9 flat config targeting `src/`)
- **Build:** `npm run build`
- **Build (Webpack):** `npm run build:webpack`
- **Start:** `npm start`
- **TypeScript Check:** `npx tsc --noEmit`

## Architecture & Technology Stack
- **Framework:** Next.js 16.4.6 with App Router (never use Pages Router)
- **React:** 19.3.1 (Server Components by default; `"use client"` only when interactive state is required)
- **Styling:** Tailwind CSS 3.4.19 strictly (DO NOT upgrade to Tailwind CSS v4)
- **Language:** TypeScript 5.9 with strict mode
- **Icons:** `lucide-react`
- **Utilities:** `clsx` and `tailwind-merge` (`cn` helper located in `@/lib/utils`)
- **Import Alias:** `@/*` maps directly to `./src/*`

## Project Structure
- `src/app/` — App Router routes, root layout, and global styles
- `src/components/ui/` — Base reusable atomic UI (`Container`, `Button`, `SectionHeading`)
- `src/components/layout/` — Global layout components (`Header`, `Navigation`, `MobileMenu`, `Footer`, `AnnouncementBar`)
- `src/components/products/` — Product cards, badges, and grids
- `src/components/home/` — Modular homepage sections
- `src/config/site.ts` — Site-wide metadata, navigation links, and brand info
- `src/data/` — Typed mock datasets (`products.ts`, `categories.ts`, `blog.ts`, `testimonials.ts`)
- `src/types/` — TypeScript interfaces (`product.ts`, `index.ts`)
- `src/lib/` — Helper functions (`utils.ts`)
- `public/images/` — Image assets partitioned by section (`banners`, `blog`, `categories`, `hero`, `icons`, `logo`, `products`, `testimonials`)

## Design Tokens & Brand Palette
- **Forest Green (`#263D18`):** Primary brand color (`bg-forest`, `text-forest`, `var(--color-forest)`)
- **Deep Green (`#1D3214`):** Dark backgrounds and footer (`bg-forest-deep`, `var(--color-deep-green)`)
- **Olive Green (`#536B35`):** Secondary buttons and accent badges (`bg-forest-olive`, `var(--color-olive-green)`)
- **Sage Green (`#A8B88A`):** Soft botanical highlights (`bg-forest-sage`, `var(--color-sage-green)`)
- **Cream (`#FBF7EE`):** Primary page background (`bg-cream`, `var(--color-cream)`)
- **Warm Beige (`#E9DCC5`):** Cards and featured panels (`bg-cream-warm`, `var(--color-warm-beige)`)
- **Soft White (`#FFFFFF`):** Product card surfaces (`bg-surface-white`, `var(--color-soft-white)`)
- **Dark Text (`#28321F`):** Main typography (`text-text-dark`, `var(--color-dark-text)`)
- **Muted Text (`#777968`):** Secondary typography (`text-text-muted`, `var(--color-muted-text)`)

## Typography
Loaded directly in `src/app/layout.tsx` HTML `<head>` via Google Fonts CDN:
- **Primary / UI:** `DM Sans` (`font-sans`, `var(--font-dm-sans)`) — for body, buttons, navigation, product info
- **Editorial / Headings:** `Cormorant Garamond` (`font-heading`, `font-serif`, `var(--font-cormorant)`) — for brand headlines, hero text, section titles

## Code Style & Standards
- **Component Design:** Modular, clean, accessible components. Inspect `src/components/` before adding new ones to prevent duplication.
- **Dynamic Routes:** In Next.js 16, route parameters are promises (`params: Promise<{ slug: string }>`). Always await params before accessing properties.
- **Type Safety:** Strict mode enabled. No `any` types. Centralize shared models in `src/types/`.
- **CSS / Styling:** Use Tailwind classes with the `cn()` helper for conditional styling. Do not inject inline arbitrary color hexes when tokens are available.
- **Responsiveness:** Mobile-first architecture with breakpoints at `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1360px`.
- **Package Hygiene:** Do not install heavy unnecessary libraries or third-party UI toolkits. Keep the bundle lean and performant.
