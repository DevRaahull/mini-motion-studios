# Deployment & Setup Manual: Mini Motion Studios

Complete guide for deploying the **Mini Motion Studios Content Desk**, connecting your Supabase database, and establishing the Google YouTube API integration with real-time telemetry.

---

## 1. Supabase Database Setup

1. Create a free account or project at [supabase.com](https://supabase.com).
2. Once your project is created, navigate to the **SQL Editor** tab on the left sidebar.
3. Open `supabase/schema.sql` from this codebase, copy all contents, and click **Run**.
   - This creates all required tables: `studio_settings`, `channels`, `pipeline_stages`, `custom_fields_definition`, `projects`, `scenes`, `characters`, `ideas`, `assets`, `ai_models`, `prompt_templates`, `stats_snapshots`, and `activity_logs`.
   - The database starts with a **clean slate**: zero seeded demo projects, zero seeded characters, zero fake numbers.
4. Retrieve your API credentials from **Project Settings > API**:
   - `Project URL` (e.g. `https://xyzcompany.supabase.co`)
   - `anon public key` (e.g. `eyJhbGciOi...`)

---

## 2. Google Cloud YouTube Data API & OAuth Setup

To enable real-time subscriber and view counts for your English YouTube channel (`UCFw0IWvKFQNsUoAHeyMgihA`):

### A. Create Project in Google Cloud Console
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Mini Motion Studios Desk`.
3. In **APIs & Services > Library**, search for and enable:
   - **YouTube Data API v3**
   - **YouTube Analytics API**

### B. Configure API Key
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > API Key**.
3. Copy the key and restrict it to **YouTube Data API v3**.
4. You can enter this key directly into the studio Onboarding Wizard or in **Customize Studio > YouTube Channel**.

### C. OAuth Consent Screen (CRITICAL: Avoiding the 7-Day Expiry)
> [!IMPORTANT]
> If your Google Cloud project is left in **"Testing"** mode:
> - Refresh tokens automatically expire after **7 days**, forcing you to re-authenticate every week.
> 
> **How to avoid this:**
> 1. In Google Cloud Console, navigate to **APIs & Services > OAuth consent screen**.
> 2. Select **External** user type.
> 3. Fill in your App Name (*Mini Motion Studios Desk*) and developer email.
> 4. Add the following read-only scopes:
>    - `https://www.googleapis.com/auth/youtube.readonly`
>    - `https://www.googleapis.com/auth/yt-analytics.readonly`
> 5. Click **Publish App** to switch the Publishing Status to **"In production"**.
> 6. Because you are using read-only personal scopes for your own channel, you do **not** need Google verification for internal channel management. Your tokens will remain permanent and never expire every 7 days!

---

## 3. Environment Variables Configuration

Create a `.env` file in the root directory (or configure these in your Vercel Dashboard):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# YouTube Configuration
VITE_YOUTUBE_CHANNEL_ID=UCFw0IWvKFQNsUoAHeyMgihA
VITE_YOUTUBE_API_KEY=your-google-api-key
```

*(Note: If environment variables are not set at deploy time, the application allows you to enter your credentials dynamically through the on-screen Onboarding Wizard or Settings modal!)*

---

## 4. Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. Set the Framework Preset to **Vite**.
5. Add the Environment Variables from Section 3 above.
6. Click **Deploy**.

---

## 5. Setting up Analytics Snapshots (Vercel Cron)

YouTube Analytics data (retention curves, CTR, traffic sources) has a natural **24-48 hour delay** from YouTube. To periodically record snapshots for delta calculations:

1. Create a `vercel.json` file in the project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/snapshot",
      "schedule": "0 */4 * * *"
    }
  ]
}
```
2. The cron job triggers every 4 hours, stores a row in `stats_snapshots`, and calculates true growth deltas (e.g., `+24 views in last 4 hours`).
