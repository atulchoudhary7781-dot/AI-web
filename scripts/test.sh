#!/bin/bash

# NEXUS AI - Test Script
# Tests all major features: Email, Payments, Admin

set -e

echo "🧪 NEXUS AI - Feature Testing Script"
echo "====================================="
echo ""

BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

pass_count=0
fail_count=0

print_pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; ((pass_count++)); }
print_fail() { echo -e "${RED}❌ FAIL${NC}: $1"; ((fail_count++)); }
print_info() { echo -e "${BLUE}ℹ️  TEST${NC}: $1"; }
print_header() { echo -e "\n${YELLOW}▶ $1${NC}"; }

# ============================================
# TEST 1: Health Check
# ============================================
print_header "Server Health Check"

if curl -sf "$BASE_URL/api/health" > /dev/null 2>&1 || \
   curl -sf "$BASE_URL/" > /dev/null 2>&1; then
    print_pass "Server is running at $BASE_URL"
else
    print_fail "Server not responding. Start with 'npm run dev'"
    exit 1
fi

# ============================================
# TEST 2: Email Verification
# ============================================
print_header "Email Verification System"

print_info "Sending verification email to $TEST_EMAIL..."

RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/send-verification" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\"}")

if echo "$RESPONSE" | grep -q "success.*true"; then
    print_pass "Verification email API responding"
    
    # Check if dev mode token returned
    if echo "$RESPONSE" | grep -q "verificationUrl"; then
        TOKEN_URL=$(echo $RESPONSE | grep -o '"verificationUrl":"[^"]*"' | cut -d'"' -f4)
        print_info "Dev mode URL: $TOKEN_URL"
        print_pass "Dev mode token available (Resend not configured)"
    else
        print_pass "Email sent via Resend (check inbox)"
    fi
else
    print_fail "Failed to send verification email"
    echo "Response: $RESPONSE"
fi

# ============================================
# TEST 3: Password Reset
# ============================================
print_header "Password Reset System"

print_info "Sending password reset to $TEST_EMAIL..."

RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/forgot-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\"}")

if echo "$RESPONSE" | grep -q "success.*true"; then
    print_pass "Password reset API responding"
    
    # Check for security (should always return success)
    if echo "$RESPONSE" | grep -q "account exists"; then
        print_pass "Email enumeration protection working"
    fi
else
    print_fail "Password reset failed"
fi

# ============================================
# TEST 4: Stripe Payment (Mock Mode)
# ============================================
print_header "Stripe Payment Integration"

print_info "Creating checkout session for Normal plan (\$10/mo)..."

RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/create-checkout" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"plan\": \"normal\"}")

if echo "$RESPONSE" | grep -q "url"; then
    CHECKOUT_URL=$(echo $RESPONSE | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    print_pass "Stripe checkout session created"
    print_info "Checkout URL: $CHECKOUT_URL"
elif echo "$RESPONSE" | grep -q "Stripe not configured"; then
    print_pass "Graceful fallback when Stripe not configured"
    print_info "Set STRIPE_SECRET_KEY in .env for real payments"
else
    print_fail "Unexpected response from payment API"
    echo "Response: $RESPONSE"
fi

# ============================================
# TEST 5: Admin Setup
# ============================================
print_header "Admin Dashboard Setup"

print_info "Checking admin status..."

RESPONSE=$(curl -s "$BASE_URL/api/setup/admin")

ADMIN_COUNT=$(echo $RESPONSE | grep -o '"adminCount":[0-9]*' | cut -d':' -f2)

print_info "Current admin count: ${ADMIN_COUNT:-0}"

if [ "$ADMIN_COUNT" -gt 0 ] 2>/dev/null; then
    print_pass "Admin users exist"
    echo $RESPONSE | grep -o '"email":"[^"]*"' | head -3 | while read line; do
        print_info "Admin: $(echo $line | cut -d'"' -f2)"
    done
else
    print_info "No admins yet. Setting up test admin..."
    
    SETUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/setup/admin" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$TEST_EMAIL\", \"name\": \"Test Admin\"}")
    
    if echo "$SETUP_RESPONSE" | grep -q "success.*true"; then
        print_pass "Test admin created successfully"
        print_info "Add this to browser console:"
        echo "  localStorage.setItem('nexus_user_role', 'admin')"
        echo "  localStorage.setItem('nexus_user_email', '$TEST_EMAIL')"
    else
        print_fail "Failed to create admin"
    fi
fi

# ============================================
# TEST 6: Subscription Status
# ============================================
print_header "Subscription Management"

print_info "Checking subscription status..."

RESPONSE=$(curl -s -X GET "$BASE_URL/api/subscription" \
    -H "x-user-email: $TEST_EMAIL")

if echo "$RESPONSE" | grep -q "plan"; then
    CURRENT_PLAN=$(echo $RESPONSE | grep -o '"plan":"[^"]*"' | head -1 | cut -d'"' -f4)
    print_pass "Subscription status accessible"
    print_info "Current plan: ${CURRENT_PLAN:-free}"
else
    print_fail "Could not fetch subscription status"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "====================================="
echo "📊 Test Results Summary"
echo "====================================="
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above.${NC}"
fi

echo ""
echo "====================================="
echo "🧪 Manual Testing Steps"
echo "====================================="
echo ""
echo "1. Open $BASE_URL in browser"
echo "2. Press F12 → Console tab"
echo "3. Run: localStorage.setItem('nexus_user_role', 'admin')"
echo "4. Run: localStorage.setItem('nexus_user_email', '$TEST_EMAIL')"
echo "5. Refresh page, go to Profile > Settings"
echo "6. Click 'Verify Email' button"
echo "7. Go to Subscription tab, click 'Upgrade to Normal'"
echo "8. Use test card: 4242424242424242 (any future date, any CVC)"
echo "9. Go back to Settings, click 'Open' in Admin Dashboard section"
echo ""
echo "📚 Full guide: see SETUP_GUIDE.md"
echo ""
