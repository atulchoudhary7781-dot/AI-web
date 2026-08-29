#!/bin/bash

# NEXUS AI - API Diagnostic Tool
# Run this to check if your AI is working!

echo "🔍 NEXUS AI Diagnostic Tool"
echo "=========================="
echo ""

# Test 1: Check if local server is running
echo "📡 Testing Local Server..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Local server running"
else
    echo "❌ Local server not running"
    echo "   Start with: npm run dev"
fi

echo ""

# Test 2: AI Response Test
echo "🤖 Testing AI Responses..."
RESPONSE1=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is AI?"}' | jq -r '.note // "Real AI Response"')

if [ "$RESPONSE1" = "Using fallback mode" ]; then
    echo "❌ FALLBACK MODE - API Key not working!"
    echo ""
    echo "⚠️  Fix Required:"
    echo "   1. Check .env file has OPENROUTER_API_KEY"
    echo "   2. Restart server: pkill -f 'next dev' && npm run dev"
    echo "   3. For Vercel: Add env vars in dashboard"
else
    echo "✅ REAL AI RESPONSE - Working!"
fi

echo ""

# Test 3: Different messages test
echo "🔄 Testing different messages..."
R1=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' | jq -r '.response' | head -c 50)

R2=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a joke"}' | jq -r '.response' | head -c 50)

if [ "$R1" = "$R2" ]; then
    echo "❌ SAME RESPONSE - Cache or API issue!"
else
    echo "✅ DIFFERENT RESPONSES - AI working correctly!"
fi

echo ""
echo "=========================="
echo "📋 Summary:"
echo "   Local: $(curl -s http://localhost:3000/api/health > /dev/null 2>&1 && echo '✅ Running' || echo '❌ Down')"
echo "   AI Mode: $([ '$RESPONSE1' = 'Using fallback mode' ] && echo '❌ Fallback' || echo '✅ Real AI')"
echo ""
echo "🚀 For live site issues:"
echo "   → Check Vercel Environment Variables"
echo "   → Redeploy after adding vars"
echo "   → URL: https://vercel.com/dashboard → Your Project → Settings"
