-- Gabochie Marketing — Initial Schema Migration
-- Run this in Supabase SQL Editor or via CLI: supabase migration up

-- ── Extensions ──
create extension if not exists "pgcrypto";

-- ── Enums ──
create type lead_source as enum ('website','google_maps','referral','facebook','instagram','walk_in','cold_call','csv_import','other');
create type funnel_stage as enum ('tofu','mofu','bofu','network');
create type lead_status as enum ('new','contacted','replied','interested','negotiating','closed_won','closed_lost','cold');
create type package_name as enum ('starter_visibility','growth_system','market_authority');
create type commitment_plan as enum ('monthly','quarterly','semiannual');
create type client_status as enum ('onboarding','active','paused','cancelled','completed');
create type gbp_status as enum ('none','unclaimed','poor','claimed','optimized');
create type offer_type as enum ('service','product','consultation','audit','other');

-- ── Admin Users ──
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Referral Codes ──
create table referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  referrer_name text not null,
  referrer_phone text,
  referrer_email text,
  reward_claimed boolean not null default false,
  reward_paid_at timestamptz,
  clicks integer not null default 0,
  conversions integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_referral_code on referral_codes(code);

-- ── Leads ──
create table leads (
  id uuid primary key default gen_random_uuid(),
  prospect_name text not null,
  business_name text not null default '',
  phone text not null default '',
  whatsapp_link text generated always as (
    case when phone ~ '^\d{9,}$' then 'https://wa.me/' || phone else null end
  ) stored,
  email text default '',
  website text default '',
  business_type text default '',
  location text default '',
  owner_name text default '',
  gbp_status gbp_status default 'none',
  gbp_link text default '',
  lead_source lead_source default 'other',
  funnel_stage funnel_stage default 'tofu',
  status lead_status default 'new',
  lead_type text default 'unknown',
  offer_type offer_type default 'service',
  product_offer text default '',
  outreach_message text default '',
  outreach_category text default '',
  last_contact timestamptz,
  next_follow_up timestamptz,
  notes text default '',
  rating integer check (rating >= 1 and rating <= 5),
  referral_code_id uuid references referral_codes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_leads_status on leads(status);
create index idx_leads_phone on leads(phone);
create index idx_leads_email on leads(email);
create index idx_leads_created on leads(created_at);
create index idx_leads_referral on leads(referral_code_id);

-- ── Outreach Messages ──
create table outreach_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  message text not null,
  provider text default 'manual',
  model text,
  ai_prompt text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_outreach_lead on outreach_messages(lead_id);

-- ── Message Templates ──
create table message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  body text not null,
  updated_at timestamptz not null default now()
);

-- ── Clients ──
create table clients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  business_name text not null default '',
  phone text default '',
  package package_name not null default 'growth_system',
  commitment commitment_plan default 'monthly',
  status client_status not null default 'onboarding',
  start_date date not null default current_date,
  monthly_rate numeric(10,2) not null default 0,
  setup_fee numeric(10,2) not null default 0,
  referred_by uuid references referral_codes(id) on delete set null,
  gbp_views integer not null default 0,
  gbp_directions integer not null default 0,
  gbp_calls integer not null default 0,
  gbp_reviews integer not null default 0,
  gbp_last_synced timestamptz,
  phase_foundation text default 'pending',
  phase_activation text default 'pending',
  phase_domination text default 'pending',
  last_invoice_at timestamptz,
  next_invoice_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clients_email on clients(email);
create index idx_clients_status on clients(status);

-- ── Client Auth Links ──
create table client_auth_links (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  client_id uuid not null unique references clients(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── Invoices / Payments ──
create table invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null default 'GHS',
  description text not null,
  status text not null default 'pending',
  due_date date not null,
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz not null default now()
);
create index idx_invoices_client on invoices(client_id);
create index idx_invoices_due on invoices(due_date) where status = 'pending';

-- ── Form Submissions ──
create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  source_page text,
  data jsonb not null,
  referral_code_id uuid references referral_codes(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index idx_form_type on form_submissions(form_type);
create index idx_form_created on form_submissions(created_at);
create index idx_form_submissions_referral on form_submissions(referral_code_id);

-- ── API Config ──
create table api_config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ── Row-Level Security ──
alter table admin_users enable row level security;
alter table leads enable row level security;
alter table outreach_messages enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table form_submissions enable row level security;
alter table referral_codes enable row level security;
alter table api_config enable row level security;

-- RLS policies
create policy "Admins full access on leads"
  on leads for all using (
    auth.role() = 'authenticated'
    and exists (select 1 from admin_users where email = auth.email())
  );

create policy "Clients own data"
  on clients for select using (
    auth.uid() in (select auth_user_id from client_auth_links where client_id = id)
  );

create policy "Anyone can insert leads"
  on leads for insert with check (true);
