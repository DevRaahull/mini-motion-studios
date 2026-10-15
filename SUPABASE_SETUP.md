# SEVEN STAR JWELS — SUPABASE DATABASE SETUP & SECURITY GUIDE

This document provides step-by-step guidance for initializing your free Supabase PostgreSQL database, verifying Row Level Security (RLS), and testing atomic RPC functions.

---

## 1. SQL Schema Installation

1. Navigate to your Supabase project dashboard at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Click the **SQL Editor** tab (terminal icon on left sidebar).
3. Click **New Query**.
4. Open `supabase/schema.sql` from your project repository, copy all text, and paste it into the SQL Editor.
5. Click **Run** in the bottom-right corner.

---

## 2. Verifying Tables and RLS Policies

Once executed, verify that the following 7 tables are visible under **Table Editor**:
1. `business_settings` (Row Level Security: Enabled)
2. `items` (Row Level Security: Enabled)
3. `sales` (Row Level Security: Enabled)
4. `sale_items` (Row Level Security: Enabled)
5. `inventory_movements` (Row Level Security: Enabled)
6. `expenses` (Row Level Security: Enabled)
7. `audit_logs` (Row Level Security: Enabled)

### Row Level Security (RLS) Guarantee
- Every single table enforces strict RLS policies.
- Unauthenticated requests cannot read, insert, update, or delete any data.
- Authenticated owner requests are scoped directly to `auth.uid() = user_id`.

---

## 3. Atomic Database Stored Procedures (RPCs)

Three security-definer database functions are compiled in PostgreSQL to guarantee zero race conditions and 100% financial correctness:

1. `create_sale_atomic(p_sale JSONB, p_items JSONB)`
   - Acquires `FOR UPDATE` row-level locks on every item being sold.
   - Validates that sufficient stock exists for each item.
   - Prevents stock from ever dropping below zero.
   - Inserts sale record and line items with immutable historical cost snapshots.
   - Decrements current stock and writes `inventory_movements` ledger entry.
   - Atomically rolls back the entire transaction if any item fails stock validation.

2. `void_sale_atomic(p_sale_id UUID, p_reason TEXT)`
   - Reverses a sale safely.
   - Restores stock quantities for each line item.
   - Records an `inventory_movement` of type `sale_cancellation`.
   - Marks the sale as `voided` with the cancellation reason.
   - Preserves historical records for audit compliance.

3. `adjust_stock_atomic(p_item_id UUID, p_quantity_change NUMERIC, p_reason TEXT)`
   - Atomically updates stock level.
   - Validates that deductions do not create negative inventory.
   - Writes an `inventory_movement` ledger record with the given reason.

---

## 4. Connecting Your Project to the Web App

Copy your **Project URL** and **Anon Public Key** from **Project Settings > API**.

You have two zero-friction options:
- **Option A (Environment Variables - Recommended for Vercel)**:
  In Vercel Project Settings > Environment Variables, add:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
  ```
- **Option B (In-App Configuration)**:
  Open the web app, navigate to **Settings**, paste your URL and Anon Key under **Multi-Device Cloud Sync**, and click **Save Settings**.
