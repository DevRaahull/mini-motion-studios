# SEVEN STAR JWELS — ZERO-COST PRODUCTION DEPLOYMENT GUIDE

> **STRICT BUDGET: ₹0.00**
> This application uses 100% free-tier, production-grade cloud services:
> - **Frontend Hosting**: Vercel Free (Hobby Plan)
> - **Cloud Database & Auth**: Supabase Free Tier (PostgreSQL + RLS)
> - **Source Control**: GitHub Free
> - **Mobile/Desktop Experience**: Native Progressive Web App (PWA)

---

## 1. Zero-Cost Architectural Overview

Both your Windows laptop and mobile phone connect to the **same authenticated Supabase PostgreSQL database**. Any sale, inventory edit, or expense recorded on your phone is instantly accessible on your laptop and vice versa.

- Laptop / Desktop Browser -> Vercel Free CDN -> Supabase Free PostgreSQL & Auth
- Mobile Phone (iOS/Android PWA) -> Vercel Free CDN -> Supabase Free PostgreSQL & Auth

---

## 2. Step 1: Create Free Supabase Project (2 Minutes)

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (Sign up with GitHub or email).
2. Click **New Project**:
   - **Name**: `seven-star-jwels`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose `South Asia (Mumbai)` for the lowest latency in India.
   - **Pricing Plan**: Select **Free ($0/month)**.
3. Click **Create new project** and wait ~1 minute for provisioning.

### Run Database Schema & RPC Functions
1. In your Supabase Project Dashboard, go to **SQL Editor** on the left menu.
2. Click **New query**.
3. Copy the entire contents of `supabase/schema.sql` from this repository and paste it into the editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. You will see: `Success. No rows returned`.
   - All 7 tables (`business_settings`, `items`, `sales`, `sale_items`, `inventory_movements`, `expenses`, `audit_logs`) are created.
   - Row Level Security (RLS) is enabled with isolation policies.
   - Atomic RPC functions (`create_sale_atomic`, `void_sale_atomic`, `adjust_stock_atomic`) are compiled.

### Copy Your API Credentials
1. Go to **Project Settings** (gear icon at bottom left) > **API**.
2. Copy:
   - **Project URL** (e.g. `https://abcdefghijkl.supabase.co`)
   - **Project API Keys** > `anon` / `public` key (starts with `eyJhbGciOi...`)

*(Never use the `service_role` key on the frontend).*

---

## 3. Step 2: Push Source Code to GitHub Free

1. In your local repository directory (`d:\website`):
   ```bash
   git status
   git add .
   git commit -m "feat: complete SEVEN STAR JWELS jewellery business management system"
   git push origin main
   ```

---

## 4. Step 3: Deploy on Vercel Free (₹0)

1. Go to [https://vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New...** > **Project**.
3. Under **Import Git Repository**, select your repository: `mini-motion-studios` (or renamed `seven-star-jwels`).
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = *(your Supabase Project URL)*
   - `VITE_SUPABASE_ANON_KEY` = *(your Supabase Anon Key)*
6. Click **Deploy**.
7. In ~45 seconds, your live application will be online at:
   `https://your-project.vercel.app`

---

## 5. Step 4: First-Run Owner Registration & Mobile PWA Installation

### Owner Account Setup
1. Open your live Vercel URL on your laptop or mobile phone.
2. Click **First-time setup? Register owner account**.
3. Enter your personal email (e.g. `owner@sevenstarjwels.com`) and a strong master password.
4. Click **Create Authorized Owner Account**.
5. Once logged in, your account is authenticated with Supabase Auth and isolated via Row Level Security (RLS).

### Installing PWA on Mobile Phone (Android)
1. Open the URL in Google Chrome on your phone.
2. Tap the three dots (menu) in top right.
3. Tap **Add to Home screen** or **Install app**.
4. The **SEVEN STAR JWELS** gold emblem icon will appear on your phone's home screen and open full-screen like a native mobile app without address bars!

### Installing PWA on iPhone (iOS)
1. Open the URL in Safari on your iPhone.
2. Tap the **Share** button (box with upward arrow) at bottom.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**. The app installs natively.

### Installing PWA on Windows Laptop / Desktop
1. In Google Chrome or Microsoft Edge, look at the right side of the address bar.
2. Click the **Install** icon (computer monitor with downward arrow).
3. The app opens in its own standalone window with taskbar pinning.

---

## 6. Free-Tier Safeguards & Policy Transparency

| Service | Free Tier Allowance | What Happens if Limit Reached? | How to Stay ₹0 Forever |
| :--- | :--- | :--- | :--- |
| **Vercel** | 100 GB monthly bandwidth, 6,000 build minutes | Bandwidth is more than enough for 50,000+ page views/month | No action needed for single-owner use |
| **Supabase DB** | 500 MB PostgreSQL storage | Holds ~500,000 jewellery sale records before reaching 500MB | Download weekly JSON backup from Backup & Restore view |
| **Supabase Auth** | 50,000 Monthly Active Users | Only 1 owner account needed | ₹0 forever |
| **Supabase Inactivity** | Pauses project after 7 days without queries | Database pauses until you click "Restore" in Supabase dashboard | Logging in once a week keeps database active continuously |

---

## 7. Troubleshooting & Recovery

- **Can I run offline?**
  Yes. The app shell is cached locally by the service worker. If the internet drops while at the jewellery counter, existing inventory records remain viewable. Creating sales is disabled while offline to prevent negative inventory and sync conflicts.
- **How do I restore my data?**
  Go to **Backup & Restore** in the navigation menu, select your downloaded `.json` file, review the pre-restore counts preview, and click **Confirm and Restore Data**.
