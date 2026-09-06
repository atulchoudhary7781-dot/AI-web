#!/bin/bash

# ============================================
# NEXUS AI - VERCEL DEPLOYMENT SCRIPT
# Run this script locally on your machine
# ============================================

echo "🚀 NEXUS AI - Vercel Deployment Script"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found! Installing..."
    npm install -g vercel
fi

echo "📦 Steps to deploy:"
echo ""
echo "1️⃣  Login to Vercel (if not logged in):"
echo "   $ vercel login"
echo ""
echo "2️⃣  Deploy to production (FORCE NEW BUILD):"
echo "   $ vercel --prod --force --no-cache"
echo ""
echo "3️⃣  Or deploy with specific options:"
echo "   $ vercel --prod --build-env NEXT_PUBLIC_FORCE_BUILD=$(date +%s)"
echo ""
echo "========================================="
echo "🔗 Live URL: https://nexus-ai-psi.vercel.app"
echo "📊 Dashboard: https://vercel.com/atulchoudhary7781-dots-projects/ai-web"
echo ""

# Ask if user wants to auto-deploy
read -p "❓ Do you want to deploy now? (y/n): " choice

if [[ $choice == "y" || $choice == "Y" ]]; then
    echo ""
    echo "🔄 Starting deployment..."
    vercel --prod --force --no-cache
else
    echo ""
    echo "✅ When ready, run: vercel --prod --force --no-cache"
fi
