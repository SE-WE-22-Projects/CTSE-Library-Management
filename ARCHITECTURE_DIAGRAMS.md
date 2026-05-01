```
╔════════════════════════════════════════════════════════════════════════════════╗
║                   CTSE Library Management Authentication Flow                  ║
╚════════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: USER REGISTRATION & LOGIN (Public Routes)                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐
│ Frontend │
│ (Vue.js) │
└────┬─────┘
     │
     │ 1. POST /api/users/auth/register
     │    or
     │    POST /api/users/auth/login
     │    {email, password}
     │
     ▼
┌──────────────────────────────┐
│    Nginx Gateway (Port 80)   │
│  ✓ No JWT validation needed  │
│  ✓ Public Endpoints          │
└────┬────────────────────────┘
     │ Forward request
     ▼
┌────────────────────────────────────┐
│  User Service (Port 3002)          │
│  • Validate credentials            │
│  • Verify against MongoDB          │
│  • Generate RSA256 JWT token       │
│  • Return token to client          │
└────────────────────────────────────┘
     │
     │ 2. Return JWT token
     ▼
┌──────────────────┐
│  Frontend        │
│  • Store token   │
│  • localStorage  │
│  • sessionStorage│
└──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: ACCESSING PROTECTED RESOURCES (With JWT Token)                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐
│ Frontend │
│ (Vue.js) │
└────┬─────┘
     │
     │ 3. GET /api/lendings
     │    Header: Authorization: Bearer <JWT_TOKEN>
     │
     ▼
┌───────────────────────────────────────────┐
│    Nginx Gateway (Port 80)                │
│  ✓ Protected Routes Handler               │
│  • Validate Authorization header          │
│  • Extract Bearer token                   │
│  • Forward to backend services            │
└────┬──────────────────────────────────────┘
     │ 4. Validate token with JWKS
     │    GET /.well-known/jwks.json
     │    from user-service
     │
     ├──────────────────────────────┐
     │                              │
     ▼                              ▼
┌────────────────────────────┐  ┌──────────────────────────┐
│  User Service (Port 3002)  │  │  Target Service          │
│  • Fetch public keys       │  │  (Lending/Book/Notif)    │
│  • Return JWKS             │  │                          │
└────────────────────────────┘  │  With JWT Guard:         │
                                │  1. Extract token        │
    ┌───────────────────────────►2. Get JWKS               │
    │                            │  3. Verify signature    │
    │                            │  4. Check expiration    │
    │                            │  5. Extract claims      │
    │                            │  6. Process request     │
    │                            │  7. Send response       │
    │                            └──────────────────────────┘
    │                                    │
    │                                    │ 5. Response
    │                                    ▼
    │                            ┌──────────────┐
    │                            │   Frontend   │
    │                            │   Display    │
    │                            │   data       │
    │                            └──────────────┘
    │
    └─ Cached for 1 hour


┌─────────────────────────────────────────────────────────────────────────────────┐
│ JWT TOKEN STRUCTURE                                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

JWT = Base64(Header) . Base64(Payload) . Signature

Header:
{
  "alg": "RS256",    ◄─ RSA with SHA-256
  "typ": "JWT"
}

Payload:
{
  "user_id": "507f1f77bcf86cd799439012",
  "session_id": "INVALID",
  "username": "john_doe",
  "permissions": ["Admin"],
  "iat": 1745928000,          ◄─ Issued At (created time)
  "exp": 1748520000           ◄─ Expiration (30 days later)
}

Signature:
RSA256(
  Base64(Header) + "." + Base64(Payload),
  private_key
)

Verified by:
RSA256_Verify(
  token,
  public_key_from_JWKS
)


┌─────────────────────────────────────────────────────────────────────────────────┐
│ MICRO-SERVICE TOKEN VALIDATION FLOW                                            │
└─────────────────────────────────────────────────────────────────────────────────┘

Request arrives at Service
     │
     ▼
┌─────────────────────────────────┐
│  JwtGuard.canActivate()         │
│  (Middleware)                   │
└────┬────────────────────────────┘
     │
     ├─ Step 1: Extract Authorization Header
     │  Authorization: Bearer eyJhbGc...
     │
     ├─ Step 2: Extract Token
     │  token = "eyJhbGc..." (remove "Bearer ")
     │
     ├─ Step 3: Fetch JWKS from user-service
     │  GET http://user_service:3002/.well-known/jwks.json
     │
     ├─ Step 4: Verify Token Signature
     │  RSA256_Verify(token, public_key)
     │
     ├─ Step 5: Check Expiration
     │  if (payload.exp < now()) → REJECT
     │
     ├─ Step 6: Extract Claims
     │  user_id, username, permissions, etc.
     │
     ├─ Step 7: Attach to Request
     │  req.user = payload
     │
     ▼
Token Valid? ─────────────┐
     │                   │
    YES                  NO
     │                   │
     │                   ▼
     │          ┌──────────────────┐
     │          │  401 Unauthorized│
     │          │  Error Response  │
     │          │  - Missing token │
     │          │  - Invalid sig   │
     │          │  - Token expired │
     │          └──────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Route Handler Executes           │
│ @Get('/')                        │
│ async getAll(@Req() req) {       │
│   // req.user available here     │
│   const userId = req.user.user_id
│   ...                            │
│ }                                │
└──────────────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Response to Client       │
│ 200 OK with data         │
└──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│ ROUTING & ENDPOINTS MATRIX                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────┬──────────────┬──────────────┐
│ Route        │ Endpoint                    │ Auth Guard   │ Port         │
├──────────────┼─────────────────────────────┼──────────────┼──────────────┤
│ LOGIN        │ POST /api/users/auth/login  │ ✗ No Guard   │ 3002         │
│ REGISTER     │ POST /api/users/auth/...    │ ✗ No Guard   │ 3002         │
│ JWKS         │ GET /.well-known/jwks.json  │ ✗ No Guard   │ 3002         │
├──────────────┼─────────────────────────────┼──────────────┼──────────────┤
│ LENDINGS     │ GET /api/lendings/*         │ ✓ JwtGuard   │ 3000         │
│ BOOKS        │ GET /api/books/*            │ ✓ JwtGuard   │ 3001         │
│ NOTIF        │ GET /api/notifications/*    │ ✓ JwtGuard   │ 3003         │
│ USERS        │ GET /api/users/* (non-auth) │ ✓ JwtGuard   │ 3002         │
└──────────────┴─────────────────────────────┴──────────────┴──────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Client Side
├─ Secure token storage (≠ localStorage for sensitive data)
├─ HTTPS only (production)
└─ Token refresh before expiration

Nginx Gateway
├─ Public/Protected route separation
├─ Header validation
├─ CORS handling
└─ Rate limiting (recommended)

Backend Services
├─ JWT Guard validation
├─ Token signature verification
├─ Expiration checking
├─ Permission-based access control
├─ User info extraction (req.user)
└─ Error handling & logging

Crypto
├─ RSA256 (Asymmetric)
├─ 2048-bit keys
├─ Private key for signing
└─ Public key for verification


┌─────────────────────────────────────────────────────────────────────────────────┐
│ ERROR SCENARIOS                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

1. NO TOKEN
   Request: GET /api/lendings
   Response: 401 Unauthorized
   Message: "Missing Authorization header"

2. INVALID FORMAT
   Request: GET /api/lendings
           Authorization: Token abc123
   Response: 401 Unauthorized
   Message: "Invalid Authorization header format. Use: Bearer <token>"

3. SIGNATURE MISMATCH
   Request: GET /api/lendings
           Authorization: Bearer fake_token
   Response: 401 Unauthorized
   Message: "Token signature verification failed"

4. TOKEN EXPIRED
   Request: GET /api/lendings
           Authorization: Bearer old_token  (30+ days old)
   Response: 401 Unauthorized
   Message: "Token expired"

5. JWKS NOT ACCESSIBLE
   Request: GET /api/lendings
           Authorization: Bearer valid_token
   Response: 503 Service Unavailable
   Message: "Unable to retrieve JWKS for validation"


┌─────────────────────────────────────────────────────────────────────────────────┐
│ KEY MANAGEMENT                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

User Service
├─ Generates RSA 2048-bit key pair
├─ Stores in keys.json (container volume)
├─ On startup:
│  ├─ Reads keys.json if exists
│  └─ Creates new keys if not exists
├─ Uses private key to sign JWT tokens
└─ Exposes public key via JWKS endpoint

Other Services
├─ Fetch public keys on first token validation
├─ Cache JWKS for 1 hour
├─ Re-fetch if verification fails
└─ Use public key to verify token signature


┌─────────────────────────────────────────────────────────────────────────────────┐
│ RECOMMENDED IMPROVEMENTS                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

DONE:
✓ RSA256 JWT implementation
✓ JWKS endpoint for public keys
✓ Gateway routing
✓ JWT Guard for backend services

TODO:
□ Add refresh token mechanism (sub-30 day tokens)
□ Implement token blacklist for logout
□ Add rate limiting on auth endpoints
□ Use HTTPS in production
□ Add session tracking (session_id currently "INVALID")
□ Implement role-based access control (RBAC)
□ Add audit logging for auth events
□ Implement API request signing
□ Add 2FA support
□ Configure CORS properly for production


┌─────────────────────────────────────────────────────────────────────────────────┐
│ TESTING                                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

Quick Test:
$ ./test-auth.sh

Manual Test:
1. Get Token:
   curl -X POST http://localhost/api/users/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"user@example.com","password":"pass"}'

2. Use Token:
   curl -X GET http://localhost/api/lendings \
        -H "Authorization: Bearer $TOKEN"

3. Verify JWKS:
   curl http://localhost/.well-known/jwks.json | jq .
```

## Summary

This diagram shows:
- How JWT authentication flows through your system
- Token structure and validation process
- Service-to-service token verification
- Error handling and security layers
- Key management and JWKS distribution

The key insight: **Token is validated by each service independently using the public keys exposed by the user-service JWKS endpoint.**
