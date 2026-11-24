create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin', 'manager', 'staff');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  image_file_id text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  short_description text,
  price numeric(12,2) not null check (price >= 0),
  original_price numeric(12,2) check (original_price is null or original_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0,
  badge text,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_active boolean not null default true,
  volume text,
  ingredients jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  how_to_use text,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text not null unique,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total numeric(12,2) not null check (total >= 0)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  image_file_id text,
  link_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  subtitle text,
  body jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Liyana Naturals',
  support_email text,
  support_phone text,
  address text,
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  announcement_enabled boolean not null default false,
  announcement_text text,
  shipping_fee numeric(12,2) not null default 0,
  free_shipping_threshold numeric(12,2),
  tax_percent numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  imagekit_file_id text not null,
  name text not null,
  url text not null,
  thumbnail_url text,
  mime text,
  size_bytes bigint,
  folder text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at before update on public.inquiries for each row execute function public.set_updated_at();
drop trigger if exists set_banners_updated_at on public.homepage_banners;
create trigger set_banners_updated_at before update on public.homepage_banners for each row execute function public.set_updated_at();

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists inquiries_status_idx on public.inquiries(status);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true and role in ('admin','manager')
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.inquiries enable row level security;
alter table public.homepage_banners enable row level security;
alter table public.site_content enable row level security;
alter table public.store_settings enable row level security;
alter table public.media_assets enable row level security;

-- RLS controls which rows a role may access; grants control whether the role
-- may access the table at all. Keep these grants explicit for Supabase roles.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.homepage_banners to authenticated;
grant select, insert, update, delete on public.site_content to authenticated;
grant select, insert, update, delete on public.store_settings to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select on public.categories, public.products, public.site_content,
  public.homepage_banners, public.store_settings to anon;
grant select on public.categories, public.products, public.site_content,
  public.homepage_banners, public.store_settings to authenticated;
grant insert on public.inquiries to anon;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories for select using (is_active);
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (is_active);
drop policy if exists "public read published content" on public.site_content;
create policy "public read published content" on public.site_content for select using (is_published);
drop policy if exists "public read active banners" on public.homepage_banners;
create policy "public read active banners" on public.homepage_banners for select using (is_active);
drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings for select using (true);
drop policy if exists "public submit inquiries" on public.inquiries;
create policy "public submit inquiries" on public.inquiries
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "profile read own" on public.profiles;
create policy "profile read own" on public.profiles for select using (id = auth.uid());
drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

do $$ declare t text;
begin
  foreach t in array array['categories','products','customers','orders','order_items','reviews','inquiries','homepage_banners','site_content','store_settings','media_assets'] loop
    execute format('drop policy if exists "admin manage %I" on public.%I', t, t);
    execute format('create policy "admin manage %I" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

insert into public.store_settings (id) values (true) on conflict (id) do nothing;

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email,full_name,role,is_active)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''), 'staff', true)
  on conflict (id) do update set email=excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_auth_user();
