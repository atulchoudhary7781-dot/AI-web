# 🚀 Supabase Setup Guide for NEXUS AI

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up / Sign in with GitHub
4. Click **"New Project"**
5. Fill details:
   - **Name**: `nexus-ai-db`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Closest to your users (Singapore/US East)
   - **Plan**: Free tier (500MB is enough for start)

## Step 2: Get Connection Details

After project creation:

1. Go to **Settings** → **Database**
2. Copy **Connection string** (URI format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. Go to **Settings** → **API**:
   - Copy **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - Copy **anon public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Copy **service role key** (SUPABASE_SERVICE_ROLE_KEY) ⚠️ SECRET!

## Step 3: Update .env File

```bash
# Replace these values in .env:
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.abc123.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://abc123.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Step 4: Push Schema to Supabase

```bash
# Install dependencies
npm install @supabase/supabase-js @supabase/ssr

# Generate Prisma client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push
```

## Step 5: Configure Row Level Security (RLS)

Supabase uses RLS for security. Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- Chats belong to users
CREATE POLICY "Users can view own chats" ON "Chat"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own chats" ON "Chat"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own chats" ON "Chat"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own chats" ON "Chat"
  FOR DELETE USING (auth.uid()::text = "UserId");

-- Service role bypasses RLS (for admin operations)
```

## Step 6: Test the Setup

```bash
# Start development server
npm run dev

# Check if app connects to Supabase
# Open http://localhost:3000 and try signing up!
```

---

## 📊 What Changed?

| Before | After |
|--------|-------|
| SQLite (file-based) | PostgreSQL (cloud) |
| Single user only | Unlimited concurrent users |
| No real-time | Real-time subscriptions ready |
| String JSON | Native JSONB support |
| No scaling | Auto-scaling ready |

## 🔐 Security Benefits

- ✅ **Row Level Security**: Users can only access their data
- ✅ **Built-in Auth**: Email verification, password reset included
- ✅ **Service Role Key**: Admin operations on server-side only
- ✅ **Anon Key**: Restricted access for client-side

## 🌐 Deployment (Vercel)

1. Add environment variables in Vercel Dashboard:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   
2. Deploy! Your app now uses production-ready PostgreSQL!

---

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Prisma + Supabase: https://supabase.com/docs/guides/integrations/prisma
- Discord: https://discord.supabase.com
