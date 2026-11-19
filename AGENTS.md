<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Liyana Naturals AI Development Guidelines

## 1. Project Overview & Architecture
- **Project Name:** Liyana Naturals
- **Purpose:** Premium organic & botanical cosmetics e-commerce web application.
- **Framework:** Next.js 16.4.6 (App Router) + React 19.3.1.
- **Styling:** Tailwind CSS 3.4.19 (Strictly v3, never upgrade to v4) + PostCSS.
- **Icons:** `lucide-react`.
- **Language:** TypeScript 5.9 (Strict mode enabled).
- **Package Manager:** `npm`.

## 2. Directory Structure & Organization
```text
src/
├── app/                  # Next.js App Router (pages, layout, metadata)
│   ├── about/            # /about route
│   ├── blog/             # /blog route
│   ├── contact/          # /contact route
│   ├── products/[slug]/  # Dynamic product details (Next 16 async params)
│   ├── shop/             # /shop catalog route
│   ├── globals.css       # Core design tokens, CSS variables, typography
│   ├── icon.tsx          # Dynamic favicon generator (ImageResponse)
│   ├── layout.tsx        # Root layout with DM Sans & Cormorant Garamond
│   └── page.tsx          # Home page
├── components/
│   ├── home/             # Homepage feature sections (Hero, Categories, etc.)
│   ├── layout/           # Shared layout (Header, Navigation, MobileMenu, Footer)
│   ├── products/         # Product components (ProductCard, ProductGrid, ProductBadge)
│   └── ui/               # Reusable atomic UI (Button, Container, SectionHeading)
├── config/
│   └── site.ts           # Site-wide metadata, navigation, branding config
├── data/                 # Strongly typed mock data (products, categories, etc.)
├── lib/
│   └── utils.ts          # Shared utilities (cn via clsx + twMerge, formatPrice)
└── types/                # Domain TypeScript interfaces (Product, BlogPost, etc.)
public/
├── fonts/                # Local font assets (if any)
└── images/               # Media categorized into subfolders:
    ├── banners/
    ├── blog/
    ├── categories/
    ├── hero/
    ├── icons/
    ├── logo/
    ├── products/
    └── testimonials/
```

## 3. Design System & Tokens
### Color Palette
Always use the established brand palette tokens:
- **Forest Green (`#263D18`):** Primary brand color (`bg-forest`, `text-forest`, `var(--color-forest)`).
- **Deep Green (`#1D3214`):** Dark sections & footer (`bg-forest-deep`, `var(--color-deep-green)`).
- **Olive Green (`#536B35`):** Secondary buttons, badges, subtle links (`bg-forest-olive`, `var(--color-olive-green)`).
- **Sage Green (`#A8B88A`):** Soft accents & selections (`bg-forest-sage`, `var(--color-sage-green)`).
- **Cream (`#FBF7EE`):** Global page background (`bg-cream`, `var(--color-cream)`).
- **Warm Beige (`#E9DCC5`):** Section cards & backdrops (`bg-cream-warm`, `var(--color-warm-beige)`).
- **Soft White (`#FFFFFF`):** Product cards & surfaces (`bg-surface-white`, `var(--color-soft-white)`).
- **Dark Text (`#28321F`):** Primary typography (`text-text-dark`, `var(--color-dark-text)`).
- **Muted Text (`#777968`):** Secondary typography & subtitles (`text-text-muted`, `var(--color-muted-text)`).

### Typography
Loaded in `src/app/layout.tsx` directly via HTML `<head>` `<link>` tags with Google Fonts preconnect (`fonts.googleapis.com` & `fonts.gstatic.com`):
- **Primary Body Font:** `DM Sans` (`var(--font-dm-sans)`, `font-sans`, `font-body`) — used for body text, navigation, buttons, product descriptions.
- **Editorial Headings:** `Cormorant Garamond` (`var(--font-cormorant)`, `font-heading`, `font-serif`) — used for headlines, hero titles, luxury brand quotes.

## 4. Coding & Architecture Standards
### Next.js 16 & React 19 Specifics
- Default to **Server Components**. Only use `"use client"` when state, effects, or browser event listeners are strictly necessary (e.g. `MobileMenu.tsx`).
- Dynamic route params in Next.js 16 are Promises:
  ```typescript
  interface Props {
    params: Promise<{ slug: string }>;
  }
  export default async function Page({ params }: Props) {
    const { slug } = await params;
    // ...
  }
  ```
- Use Next.js `<Link>` for internal navigation and `next/image` `<Image>` for visual assets.

### TypeScript Conventions
- Strict mode is enforced. Never use `any`; use concrete types or `unknown` with narrowing.
- Domain models belong in `src/types/` (e.g. `Product`, `ProductCategory`, `BlogPost`, `Testimonial`).
- Component props must be typed with interfaces (e.g. `interface ButtonProps extends ...`).
- Use the `@/*` import alias mapped to `./src/*`. Avoid relative traversal imports like `../../..`.

### Tailwind CSS v3 Rules
- **Strictly Tailwind CSS v3.4.x.** Never install or migrate to Tailwind v4.
- Use utility combinations with `cn()` from `@/lib/utils` for conditional classes.
- Do not hardcode random hex values in inline JSX classes when design system variables/utilities are already defined.
- Avoid heavy custom CSS in component files; extend `tailwind.config.ts` or add reusable utility classes in `src/app/globals.css`.

### Reusable Component Guidelines
- Place reusable primitives in `src/components/ui/` (`Container`, `Button`, `SectionHeading`).
- Place domain components in their respective subdirectories (`components/products/`, `components/layout/`, `components/home/`).
- Avoid duplicate components. Check existing components before creating new ones.

### Responsive Design
- Mobile-first approach:
  - Mobile: `< 640px`
  - Tablet: `sm: 640px`, `md: 768px`
  - Desktop: `lg: 1024px`, `xl: 1280px`, `2xl: 1360px`
- Use the `<Container>` component or `site-container` class for unified horizontal padding and alignment.

### Accessibility & Performance
- Maintain accessible color contrast (Forest Green `#263D18` on Cream `#FBF7EE` or White `#FFFFFF`).
- Ensure accessible focus indicators (`focus-visible:ring-2 focus-visible:ring-[#536B35]`).
- All interactive buttons and links must have descriptive labels or `aria-label`.
- All images must include descriptive `alt` text.

## 5. Development & Build Commands
- `npm run dev` — Start the local development server (`http://localhost:3000`).
- `npm run lint` — Run ESLint across `src/` (configured with ESLint 9 flat config).
- `npm run build` — Create optimized Next.js production build.
- `npm run build:webpack` — Run production build using Webpack fallback if required.
- `npm start` — Start the production server.

## 6. Dependency & Code Hygiene
- Do not install heavyweight UI component libraries (e.g. MUI, Chakra, Radix whole packages).
- Keep dependencies minimal, stable, and compatible with React 19 and Next.js 16.
- Do not leave empty unreferenced files, debugging `console.log` statements, or commented-out blocks.
