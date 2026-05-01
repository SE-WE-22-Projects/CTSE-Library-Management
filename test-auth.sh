#!/bin/bash

# ============================================
# CTSE Library Management - Auth Testing Guide
# ============================================
# This script contains examples for testing JWT authentication

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost"
TOKEN_FILE="auth_token.txt"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}CTSE Library Management - Auth Testing${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ============================================
# 1. REGISTER A NEW USER
# ============================================
echo -e "${YELLOW}Step 1: Register a new user${NC}"
echo -e "${BLUE}POST /api/users/auth/register${NC}\n"

REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Response:"
echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extract token from registration
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token // .token // empty' 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo -e "${RED}⚠️  No token in registration response. You may need to login instead.${NC}\n"
else
  echo -e "${GREEN}✓ Token received from registration${NC}"
  echo "$TOKEN" > "$TOKEN_FILE"
fi

# ============================================
# 2. LOGIN WITH CREDENTIALS
# ============================================
echo -e "${YELLOW}Step 2: Login with credentials${NC}"
echo -e "${BLUE}POST /api/users/auth/login${NC}\n"

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token from login
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // .token // empty' 2>/dev/null)
if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Token received from login${NC}"
  echo "$TOKEN" > "$TOKEN_FILE"
  echo -e "${BLUE}Token saved to: $TOKEN_FILE${NC}\n"
else
  echo -e "${RED}✗ No token received from login response${NC}\n"
  echo "Make sure user exists. Try registration first."
  exit 1
fi

# ============================================
# 3. VERIFY TOKEN (Decode)
# ============================================
echo -e "${YELLOW}Step 3: Verify token structure${NC}"
echo -e "${BLUE}Decoding JWT (without verification):${NC}\n"

# Simple JWT decoder (requires jq)
IFS='.' read -r header payload signature <<< "$TOKEN"

# Decode payload (add padding if needed)
payload_padded="${payload}=="
DECODED_PAYLOAD=$(echo "$payload_padded" | base64 -d 2>/dev/null | jq . 2>/dev/null)

echo "Token Payload:"
echo "$DECODED_PAYLOAD" | jq . 2>/dev/null || echo "Could not decode. Token format may be invalid."
echo ""

# ============================================
# 4. TEST PROTECTED ENDPOINT - WITH TOKEN
# ============================================
echo -e "${YELLOW}Step 4: Access protected endpoint WITH token${NC}"
echo -e "${BLUE}GET /api/lendings${NC}"
echo -e "${RED}(Requires JWT Guard to be implemented in lending service)${NC}\n"

LENDINGS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/lendings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$LENDINGS_RESPONSE" | jq . 2>/dev/null || echo "$LENDINGS_RESPONSE"
echo ""

# Check if successful
if echo "$LENDINGS_RESPONSE" | jq -e '.data' &>/dev/null; then
  echo -e "${GREEN}✓ Successfully accessed protected endpoint${NC}\n"
else
  if echo "$LENDINGS_RESPONSE" | grep -q "Unauthorized\|Missing Authorization\|Invalid token"; then
    echo -e "${RED}✗ Token rejected${NC}"
    echo -e "${YELLOW}Possible reasons:${NC}"
    echo "  1. JWT Guard not implemented in lending service"
    echo "  2. Token signature verification failed"
    echo "  3. Token expired"
    echo "  4. User service JWKS not accessible"
  fi
  echo ""
fi

# ============================================
# 5. TEST PROTECTED ENDPOINT - WITHOUT TOKEN
# ============================================
echo -e "${YELLOW}Step 5: Access protected endpoint WITHOUT token${NC}"
echo -e "${BLUE}GET /api/lendings${NC}\n"

NO_TOKEN_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/lendings" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$NO_TOKEN_RESPONSE" | jq . 2>/dev/null || echo "$NO_TOKEN_RESPONSE"
echo ""

if echo "$NO_TOKEN_RESPONSE" | grep -q "Unauthorized\|Missing Authorization" || echo "$NO_TOKEN_RESPONSE" | jq -e '.statusCode == 401' &>/dev/null; then
  echo -e "${GREEN}✓ Correctly rejected request without token${NC}\n"
else
  echo -e "${YELLOW}⚠️  Endpoint might not have JWT protection${NC}\n"
fi

# ============================================
# 6. TEST WITH INVALID TOKEN
# ============================================
echo -e "${YELLOW}Step 6: Access protected endpoint WITH invalid token${NC}"
echo -e "${BLUE}GET /api/lendings${NC}\n"

INVALID_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.invalid"

INVALID_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/lendings" \
  -H "Authorization: Bearer $INVALID_TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$INVALID_RESPONSE" | jq . 2>/dev/null || echo "$INVALID_RESPONSE"
echo ""

if echo "$INVALID_RESPONSE" | grep -q "Unauthorized\|Invalid token\|verification failed" || echo "$INVALID_RESPONSE" | jq -e '.statusCode == 401' &>/dev/null; then
  echo -e "${GREEN}✓ Correctly rejected invalid token${NC}\n"
else
  echo -e "${YELLOW}⚠️  Invalid token was not rejected${NC}\n"
fi

# ============================================
# 7. GET PUBLIC JWKS
# ============================================
echo -e "${YELLOW}Step 7: Access public JWKS endpoint${NC}"
echo -e "${BLUE}GET /.well-known/jwks.json${NC}\n"

JWKS_RESPONSE=$(curl -s -X GET "${BASE_URL}/.well-known/jwks.json" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$JWKS_RESPONSE" | jq . 2>/dev/null || echo "$JWKS_RESPONSE"
echo ""

if echo "$JWKS_RESPONSE" | jq -e '.keys' &>/dev/null; then
  echo -e "${GREEN}✓ JWKS endpoint accessible and returns keys${NC}\n"
else
  echo -e "${RED}✗ Failed to get JWKS${NC}\n"
fi

# ============================================
# 8. TEST CREATE LENDING (POST)
# ============================================
echo -e "${YELLOW}Step 8: Create a new lending record${NC}"
echo -e "${BLUE}POST /api/lendings${NC}\n"

CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/lendings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "607f1f77bcf86cd799439011",
    "userId": "607f1f77bcf86cd799439012"
  }')

echo "Response:"
echo "$CREATE_RESPONSE" | jq . 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo "✓ Registered/Logged in user"
echo "✓ Received JWT token"
echo "✓ Token saved to: $TOKEN_FILE"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Implement JWT Guard in all services"
echo "2. Add @UseGuards(JwtGuard) to protected routes"
echo "3. Test again with all services protected"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- See AUTH_GUIDE.md for architecture details"
echo "- See IMPLEMENTATION_EXAMPLE.md for code examples"
echo ""

# Optional: Display token for manual testing
echo -e "${YELLOW}Your JWT Token (valid for 30 days):${NC}"
echo -e "${GREEN}$TOKEN${NC}\n"

echo -e "${BLUE}Use this token in requests:${NC}"
echo 'curl -H "Authorization: Bearer '$TOKEN'" http://localhost/api/lendings'
echo ""
