# 🚀 NEXUS AI - Production Setup Guide

This guide walks you through setting up **Resend (Email)**, **Stripe (Payments)**, and **Admin Access** for your NEXUS AI application.

---

## 📧 1. Resend Email Setup (Free Tier Available)

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click **"Get Started"** → Sign up with GitHub/Google
3. You'll land on the dashboard

### Step 2: Get API Key

1. Go to **API Keys** in the sidebar
2. Click **"Create API Key"**
3. Name it: `NEXUS AI Production`
4. Copy the key (starts with `re_`)

### Step 3: Add Domain (or use test domain)

**Option A: Use Resend's free test domain (quickest)**
- Your emails will come from `onboarding@resend.dev`
- Works immediately, no DNS setup needed
- Great for development/testing

**Option B: Add your custom domain (for production)**
1. Go to **Domains** → **Add Domain**
2. Enter your domain (e.g., `nexusai.com`)
3. Add these DNS records:

```
Type: TXT
Name: _resend
Value: resend-verification-code-here

Type: MX
Name: send
Value: feedback-smtp.us-east-1.amazonses.com (Priority: 10)

Type: SPF (TXT)
Name: @
Value: v=spf1 include:amazonses.com ~all

Type: DKIM (CNAME)
Name: resend._domainkey
Value: resend-key-here.dkim.amazonses.com
```

4. Wait for verification (usually 5-30 minutes)
5. Once verified, you can send from `anyone@yourdomain.com`

### Step 4: Configure Environment Variables

```bash
# In your .env file:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=NEXUS AI <noreply@yourdomain.com>
```

### Step 5: Test Email Sending

```bash
# Test with curl or use the profile page "Verify Email" button
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

---

## 💳 2. Stripe Payment Setup

### Step 1: Create Stripe Account

1. Go to [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up (you'll need business details for production)
3. For testing, you can start immediately in **Test Mode**

### Step 2: Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy **Secret Key** (starts with `sk_test_`)
3. Copy **Publishable Key** (starts with `pk_test_`)
4. ⚠️ **Never expose your secret key!**

### Step 3: Create Products & Prices

#### Method A: Using Stripe Dashboard (Recommended)

1. Go to **Products** → **Add Product**

**Product 1: Normal Plan**
```
Name: NEXUS AI Normal Plan
Description: Unlimited chats, advanced AI models, priority support
Pricing:
  - Amount: $10.00
  - Interval: Monthly
  - Currency: USD
```

2. Click **Save Product** → Copy the **Price ID** (looks like `price_xxx`)

3. Repeat for Pro Plan:

**Product 2: Pro Plan**
```
Name: NEXUS AI Pro Plan  
Description: Everything in Normal + GPT-4, image generation, API access
Pricing:
  - Amount: $20.00
  - Interval: Monthly
  - Currency: USD
```

4. Save and copy this Price ID too

#### Method B: Using Stripe CLI (For developers)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# Or download from https://stripe.com/docs/cli

# Login to Stripe
stripe login

# Create Normal Plan ($10/month)
stripe products create \
  --name="NEXUS AI Normal Plan" \
  --description="Unlimited chats, advanced AI, priority support"

# Get product ID and create price
stripe prices create \
  --product=prod_xxx \
  --unit-amount=1000 \  # $10.00 in cents
  --currency=usd \
  -recurring[interval]=month

# Create Pro Plan ($20/month)  
stripe products create \
  --name="NEXUS AI Pro Plan" \
  --description="Everything + GPT-4, images, API access"

stripe prices create \
  --product=prod_yyy \
  --unit-amount=2000 \  # $20.00 in cents
  --currency=usd \
  -recurring[interval]=month
```

### Step 4: Setup Webhook (Critical!)

Webhooks notify your app when payments succeed/fail.

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://your-domain.com/api/payments/webhook`
4. Events to listen for:
   ```
   ✓ checkout.session.completed
   ✓ customer.subscription.created
   ✓ customer.subscription.updated
   ✓ customer.subscription.deleted
   ✓ invoice.paid
   ✓ invoice.payment_failed
   ```
5. Click **Add endpoint**
6. Copy the **Signing Secret** (starts with `whsec_`)

### Step 5: Test Webhook Locally

```bash
# Forward Stripe webhooks to localhost
stripe listen --forward-to localhost:3000/api/payments/webhook

# This gives you a test webhook secret
# Use it in your .env as STRIPE_WEBHOOK_SECRET
```

### Step 6: Configure Environment Variables

```bash
# In .env file:
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_NORMAL=price_xxx  # From step 3
STRIPE_PRICE_PRO=price_yyy     # From step 3
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

---

## 👑 3. Admin Dashboard Setup

### Option A: Set Admin via Browser Console

1. Open your app in browser
2. Press F12 (DevTools) → Console tab
3. Run:
```javascript
localStorage.setItem('nexus_user_role', 'admin')
localStorage.setItem('nexus_user_email', 'your-admin@email.com')
```
4. Refresh page → Admin Dashboard link appears in Settings

### Option B: Set Admin via API

```bash
# Update user role directly in database
curl -X PUT http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "x-user-email: your-admin@email.com" \
  -d '{
    "userId": "user-id-from-db",
    "action": "update_role",
    "role": "admin"
  }'
```

### Option C: Direct Database Update

```bash
# Using Prisma Studio (visual DB editor)
npx prisma studio

# Or using SQLite CLI
sqlite3 db/custom.db
UPDATE User SET role = 'admin' WHERE email = 'your-admin@email.com';
```

---

## 🧪 4. Testing Guide

### Test Cards (Stripe Test Mode)

Use these cards to test payments without real charges:

| Card Number | Type | Result |
|-------------|------|--------|
| `4242424242424242` | Visa | Success ✅ |
| `4000056655665556` | Declined | Failure ❌ |
| `4000000000009995` | Insufficient Funds | Failure ❌ |
| `5555555555554444` | Mastercard | Success ✅ |
| `378282246310005` | Amex | Success ✅ |

**Any future date** for expiry (e.g., `12/28`)
**Any 3-digit CVC** (e.g., `123`)
**Any ZIP code** (e.g., `12345`)

### Testing Email Verification

1. With Resend configured: Real email sent
2. Without Resend: Check server logs for token URL
3. Visit URL manually: `/api/auth/verify-email?token=TOKEN_HERE`

### Testing Password Reset

1. Trigger reset from Settings page
2. Check email/logs for reset link
3. Visit: `/auth/reset-password?token=TOKEN_HERE`
4. Enter new password (min 8 chars)

### Testing Subscription Flow

1. Go to Profile → Subscription tab
2. Click "Upgrade to Normal" or "Upgrade to Pro"
3. Enter test card: `4242424242424242`
4. Complete checkout
5. Redirected back with `?success=true`
6. Plan should be updated!

---

## 🔒 5. Security Checklist

Before going to production:

- [ ] Change all secrets from test to live keys
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Verify webhook signature validation works
- [ ] Set up CORS for your domain only
- [ ] Enable rate limiting on auth endpoints
- [ ] Review admin permissions carefully
- [ ] Test with real small payment first ($1)

---

## 🚀 6. Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

```bash
# Quick deploy command
vercel --prod
```

---

## 📞 Support & Resources

- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

---

**Need help?** Check the `.env.example` file for all required variables!
