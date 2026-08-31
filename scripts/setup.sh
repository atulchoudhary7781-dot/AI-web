#!/bin/bash

# NEXUS AI - Quick Setup Script
# This script helps you set up Resend, Stripe, and Admin access

set -e

echo "🚀 NEXUS AI - Production Setup Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from template..."
    cp .env.example .env
    print_info "Please edit .env with your API keys"
fi

echo ""
echo "📧 STEP 1: Resend Email Setup"
echo "-------------------------------"
print_info "1. Go to https://resend.com and sign up"
print_info "2. Go to API Keys and create a new key"
read -p "Enter your Resend API key (re_xxx): " RESEND_KEY

if [ -n "$RESEND_KEY" ]; then
    # Update .env file
    if grep -q "RESEND_API_KEY" .env; then
        sed -i '' "s/RESEND_API_KEY=.*/RESEND_API_KEY=$RESEND_KEY/" .env 2>/dev/null || \
        sed -i "s/RESEND_API_KEY=.*/RESEND_API_KEY=$RESEND_KEY/" .env
    else
        echo "RESEND_API_KEY=$RESEND_KEY" >> .env
    fi
    print_success "Resend API key added!"
else
    print_warning "Skipping Resend setup (will use dev mode)"
fi

echo ""
echo "💳 STEP 2: Stripe Payment Setup"
echo "---------------------------------"
print_info "1. Go to https://dashboard.stripe.com/register (use Test Mode)"
print_info "2. Go to Developers > API Keys"
read -p "Enter your Stripe Secret Key (sk_test_xxx): " STRIPE_SECRET

if [ -n "$STRIPE_SECRET" ]; then
    # Update .env file
    sed -i '' "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET|" .env 2>/dev/null || \
    sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET|" .env
    
    print_info "Now get your Price IDs from Stripe Dashboard > Products:"
    read -p "Normal Plan Price ID (price_xxx): " PRICE_NORMAL
    read -p "Pro Plan Price ID (price_xxx): " PRICE_PRO
    
    sed -i '' "s|STRIPE_PRICE_NORMAL=.*|STRIPE_PRICE_NORMAL=$PRICE_NORMAL|" .env 2>/dev/null || \
    sed -i "s|STRIPE_PRICE_NORMAL=.*|STRIPE_PRICE_NORMAL=$PRICE_NORMAL|" .env
    
    sed -i '' "s|STRIPE_PRICE_PRO=.*|STRIPE_PRICE_PRO=$PRICE_PRO|" .env 2>/dev/null || \
    sed -i "s|STRIPE_PRICE_PRO=.*|STRIPE_PRICE_PRO=$PRICE_PRO|" .env
    
    print_success "Stripe configuration added!"
    
    print_info "Webhook Setup:"
    print_info "Go to Stripe > Developers > Webhooks > Add endpoint"
    print_info "URL: http://localhost:3000/api/payments/webhook (or your domain)"
    read -p "Enter Webhook Secret (whsec_xxx) or press Enter to skip: " WEBHOOK_SECRET
    
    if [ -n "$WEBHOOK_SECRET" ]; then
        sed -i '' "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env 2>/dev/null || \
        sed -i "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env
        print_success "Webhook secret added!"
    fi
else
    print_warning "Skipping Stripe setup (payments will use mock mode)"
fi

echo ""
echo "👑 STEP 3: Admin User Setup"
echo "-----------------------------"
print_info "Setting up admin access..."
read -p "Enter admin email address: " ADMIN_EMAIL
read -p "Enter admin name: " ADMIN_NAME

if [ -n "$ADMIN_EMAIL" ]; then
    # Call the setup API
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/setup/admin \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$ADMIN_EMAIL\", \"name\": \"$ADMIN_NAME\"}" 2>/dev/null || echo "{}")
    
    print_success "Admin user configured!"
    print_info "Run these commands in browser console (F12):"
    echo ""
    echo "  localStorage.setItem('nexus_user_role', 'admin');"
    echo "  localStorage.setItem('nexus_user_email', '$ADMIN_EMAIL');"
    echo ""
fi

echo ""
echo "🔧 STEP 4: Final Configuration"
echo "------------------------------"
read -p "Your app URL (default: http://localhost:3000): " APP_URL
APP_URL=${APP_URL:-http://localhost:3000}

sed -i '' "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$APP_URL|" .env 2>/dev/null || \
sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$APP_URL|" .env

print_success "Configuration complete!"

echo ""
echo "======================================"
echo "🎉 Setup Complete!"
echo "======================================"
echo ""
print_info "Next steps:"
echo "  1. Run 'npm run dev' to start development server"
echo "  2. Visit $APP_URL/profile"
echo "  3. Test email verification in Settings tab"
echo "  4. Test payment upgrade in Subscription tab"
echo "  5. Access Admin Dashboard from Settings (if admin)"
echo ""
print_info "Test Stripe Cards (Test Mode only):"
echo "  • Success: 4242424242424242"
echo "  • Declined: 4000000000009995"
echo ""
print_info "Full guide available in SETUP_GUIDE.md"
echo ""

# Push database schema
print_info "Updating database schema..."
npx prisma db push --accept-data-loss 2>/dev/null && \
    print_success "Database updated!" || \
    print_error "Failed to update database"

echo ""
print_success "All done! 🚀"
