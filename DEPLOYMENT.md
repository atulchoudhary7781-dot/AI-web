# 🚀 NEXUS AI - Deployment Guide

## ⚠️ Required Environment Variables

**Vercel Dashboard → Settings → Environment Variables** mein yeh add karo:

### 🔑 **CRITICAL - AI API (Required)**
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx  # Get from: https://openrouter.ai/keys
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
```

### 🗄️ **Database - Supabase PostgreSQL** (Optional - for production)
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 💳 **Stripe Payments** (Optional)
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ✅ Quick Deploy Checklist

1. [x] OpenRouter API Key added in Vercel env vars
2. [ ] Supabase setup (if using PostgreSQL) - see `SUPABASE_SETUP.md`
3. [ ] Stripe keys (if accepting payments)
4. [ ] Email service (if sending emails)

## 🧪 Test After Deployment

```bash
# Test AI API
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'

# Expected response:
# {"response": "I'm NEXUS, your AI assistant..."}
```

## 📱 Current Status

**AI Status**: ✅ Working (OpenRouter + Llama 3.1 8B)
**Database**: SQLite (local) / Supabase (production ready)
**Deployment**: GitHub → Vercel auto-deploy

---

## Need Help?

- **OpenRouter**: https://openrouter.ai/keys
- **Supabase**: See `SUPABASE_SETUP.md`
- **Vercel**: https://vercel.com/dashboard → Your Project → Settings
