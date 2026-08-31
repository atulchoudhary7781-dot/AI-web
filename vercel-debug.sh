#!/bin/bash

# NEXUS AI - Vercel Debug Script
# Run this to check your live site!

echo "🔍 NEXUS AI Live Site Debugger"
echo "================================"
echo ""

# Test all possible URLs
URLS=(
  "https://ai-web.vercel.app"
  "https://nexus-ai.vercel.app" 
  "https://nexus-ai-psi.vercel.app"
)

echo "📍 Testing URLs..."
for url in "${URLS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  echo "$url → Status: $STATUS"
done

echo ""
echo "🤖 Testing AI API..."
MAIN_URL="https://nexus-ai-psi.vercel.app"

RESPONSE=$(curl -s -X POST "$MAIN_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' 2>/dev/null)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "NEXUS AI"; then
  echo ""
  echo "✅ AI WORKING! Real response detected!"
elif echo "$RESPONSE" | grep -q "error"; then
  echo ""
  echo "❌ ERROR DETECTED! API not working"
  echo ""
  echo "🔧 TROUBLESHOOTING STEPS:"
  echo "1. Go to: https://vercel.com/dashboard"
  echo "2. Open your project"
  echo "3. Go to 'Deployments' tab"
  echo "4. Click '...' on latest deployment"
  echo "5. Select 'Redeploy'"
  echo "6. ⚠️  UNCHECK 'Build with existing cache'"
  echo "7. Confirm Redeploy"
  echo ""
  echo "⏳ Wait 5 minutes then test again"
else
  echo ""
  echo "⚠️ Unknown response format"
fi

echo ""
echo "================================"
echo "📋 Quick Fix Checklist:"
echo "□ Env vars added in Vercel dashboard?"
echo "□ Redeployed WITHOUT cache?"
echo "□ Waited 5+ minutes for build?"
echo "□ Tested different messages?"
echo ""
echo "🚀 Need help? Check Vercel logs:"
echo "→ Deployments → Your Deployment → Functions → /api/chat"
