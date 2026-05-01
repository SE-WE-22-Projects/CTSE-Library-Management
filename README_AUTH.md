# 🔐 CTSE Library Management - Authentication & Authorization Setup

## 📋 Overview

Your project uses **RSA256 JWT (JSON Web Tokens)** for secure authentication and authorization. This README guides you through what was implemented and how to use it.

---

## 📁 New Files Created

### Documentation Files
| File | Size | Purpose |
|------|------|---------|
| **QUICK_REFERENCE.md** | 📄 | **START HERE** - Quick reference guide (5 min read) |
| **AUTH_GUIDE.md** | 📖 | Complete authentication documentation |
| **IMPLEMENTATION_EXAMPLE.md** | 💻 | Code examples for adding JWT to services |
| **ARCHITECTURE_DIAGRAMS.md** | 📊 | Visual flow diagrams and architecture |
| **AUTHENTICATION_SUMMARY.md** | 📝 | What was implemented and status |

### Code Files
| File | Purpose |
|------|---------|
| `services/user-service/src/common/guards/jwt.guard.ts` | JWT validation guard (copy to other services) |
| `docker/config/nginx.conf` | Updated nginx configuration |
| `docker/config/jwt-validator.lua` | Optional gateway-level validator |

### Testing
| File | Purpose |
|------|---------|
| `test-auth.sh` | Automated testing script |

---

## 🚀 Quick Start (Choose Your Path)

### Path A: I Just Want to Test It ⚡
```bash
cd /home/navindu/Documents/SLIIT/CTSE/assignment-1/CTSE-Library-Management
chmod +x test-auth.sh
./test-auth.sh
```

**Result:** Full test of authentication flow with colored output

---

### Path B: I Want to Understand It 📚
Read in this order:
1. **QUICK_REFERENCE.md** (5 min) - Overview and key concepts
2. **ARCHITECTURE_DIAGRAMS.md** (10 min) - Visual flow diagrams
3. **AUTH_GUIDE.md** (30 min) - Deep dive into auth system

---

### Path C: I Need to Implement It 💻
1. **QUICK_REFERENCE.md** - What's what
2. **IMPLEMENTATION_EXAMPLE.md** - Copy-paste ready code
3. **AUTH_GUIDE.md** - Reference during implementation

---

## 🎯 What Was Done

### ✅ Completed
- [x] Analyzed project's JWT authentication mechanism
- [x] Identified RSA256 token generation in user-service
- [x] Created reusable JWT Guard for NestJS services
- [x] Updated nginx configuration with public/protected route separation
- [x] Created comprehensive documentation (5 files)
- [x] Built automated testing script

### ⏳ Ready for Implementation
- [ ] Add JWT Guard to lending-service
- [ ] Add JWT Guard to book-service
- [ ] Add JWT Guard to notification-service
- [ ] Verify all protected routes work

---

## 🔐 Authentication Flow

```
User Login → Get JWT Token → Store in Frontend
                ↓
Request with Token → Nginx Gateway → Backend Service
                                      (JWT Guard validates)
                                      ↓
                              Extract user claims → Process request
```

---

## 📋 Checklist to Complete

### Phase 1: Understand ✓
- [x] Read documentation
- [x] Understand JWT token structure
- [x] Know the flow

### Phase 2: Test ✓
- [x] Run test-auth.sh
- [x] Verify user service works
- [x] Check JWKS endpoint

### Phase 3: Implement 
- [ ] Copy JWT Guard to lending-service
- [ ] Copy JWT Guard to book-service
- [ ] Copy JWT Guard to notification-service
- [ ] Add @UseGuards(JwtGuard) to routes
- [ ] Test protected endpoints
- [ ] Verify 401 errors for missing tokens

### Phase 4: Verify
- [ ] All services reject unauthorized requests
- [ ] All services accept valid tokens
- [ ] User info available in req.user
- [ ] Permission checks work

---

## 🔑 Key Information

### JWT Token Claims
```javascript
{
  user_id: "507f...",        // Database user ID
  username: "john_doe",       // Username
  permissions: ["Admin"],     // User permissions
  session_id: "INVALID",      // Session tracking (placeholder)
  exp: 1748520000,            // Expiration timestamp
  iat: 1745928000             // Issued at timestamp
}
```

### Public Routes (No Auth)
```
POST   /api/users/auth/login       ← Get token here
POST   /api/users/auth/register    ← Create account
GET    /.well-known/jwks.json      ← Get public keys
```

### Protected Routes (JWT Required)
```
GET    /api/lendings/*             ← Needs JWT
POST   /api/books/*                ← Needs JWT
GET    /api/notifications/*        ← Needs JWT
GET    /api/users/*                ← Needs JWT (except /auth/*)
```

---

## 🧪 Testing With Curl

### Get Token
```bash
curl -X POST http://localhost/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```

### Use Token (Will fail if JWT Guard not implemented)
```bash
TOKEN="your_token_from_login"
curl -X GET http://localhost/api/lendings \
  -H "Authorization: Bearer $TOKEN"
```

### Test Without Token (Should get 401)
```bash
curl -X GET http://localhost/api/lendings
# 401 Unauthorized: Missing Authorization header
```

---

## 📖 Documentation Quick Links

| Need | File | Time |
|------|------|------|
| Quick overview | QUICK_REFERENCE.md | 5 min |
| Visual diagrams | ARCHITECTURE_DIAGRAMS.md | 10 min |
| Full details | AUTH_GUIDE.md | 30 min |
| Code examples | IMPLEMENTATION_EXAMPLE.md | 15 min |
| What was done | AUTHENTICATION_SUMMARY.md | 5 min |

---

## 🛠️ Common Tasks

### Add JWT Protection to a Route
```typescript
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtGuard)
@Get('protected-route')
async getProtected(@Req() req: Request) {
  console.log('User ID:', req.user.user_id);
  // Your logic here
}
```

### Access User Information
```typescript
@UseGuards(JwtGuard)
@Get()
async getAll(@Req() req: Request) {
  // All available in req.user:
  // - user_id
  // - username
  // - permissions
  // - exp (expiration)
}
```

### Check Permissions
```typescript
@UseGuards(JwtGuard)
@Post('admin-only')
async adminOnly(@Req() req: Request) {
  if (!req.user.permissions.includes('Admin')) {
    throw new ForbiddenException('Admin access required');
  }
  // Admin logic here
}
```

---

## 🆘 Troubleshooting

### "401 Unauthorized - Missing Authorization header"
- Make sure you're sending the header: `Authorization: Bearer <token>`
- Don't forget the space between "Bearer" and the token

### "Token signature verification failed"
- User-service might not be running
- Check JWKS endpoint: `curl http://localhost/.well-known/jwks.json`

### "ECONNREFUSED at user_service:3002"
- Verify docker-compose is running
- Check service connectivity from other containers

### "Token expired"
- Get a new token by logging in again
- Tokens are valid for 30 days

---

## 🔒 Security Status

### ✅ Implemented
- RSA256 encryption (strong)
- 2048-bit RSA keys
- Token expiration (30 days)
- Bcrypt password hashing (10 rounds)
- Public/private key separation

### ⚠️ Recommended for Production
- Add HTTPS/TLS
- Implement refresh tokens
- Add rate limiting on auth endpoints
- Add token blacklist/logout mechanism
- Enable audit logging
- Implement 2FA

---

## 📊 System Architecture

```
Frontend (Vue.js)
    ↓
Nginx Gateway (Port 80)
    ↓
├─ User Service (Port 3002) - Manages auth & tokens
├─ Lending Service (Port 3000) - With JWT Guard
├─ Book Service (Port 3001) - With JWT Guard
└─ Notification Service (Port 3003) - With JWT Guard

Each service validates tokens using public keys from:
GET /.well-known/jwks.json (from User Service)
```

---

## 📞 Next Steps

1. **Read** → Start with QUICK_REFERENCE.md
2. **Understand** → Review ARCHITECTURE_DIAGRAMS.md
3. **Test** → Run ./test-auth.sh
4. **Implement** → Follow IMPLEMENTATION_EXAMPLE.md
5. **Verify** → Ensure all services have JWT protection
6. **Deploy** → Push to production with HTTPS

---

## 📝 Files Reference

```
CTSE-Library-Management/
├── README_AUTH.md                          ← You are here
├── QUICK_REFERENCE.md                      ← Start here
├── AUTH_GUIDE.md                           ← Deep dive
├── ARCHITECTURE_DIAGRAMS.md                ← Visual guide
├── IMPLEMENTATION_EXAMPLE.md               ← Code examples
├── AUTHENTICATION_SUMMARY.md               ← What was done
├── test-auth.sh                            ← Testing script
├── docker/
│   └── config/
│       ├── nginx.conf                      ← Updated config
│       └── jwt-validator.lua               ← Optional validator
└── services/
    └── user-service/
        └── src/
            └── common/
                └── guards/
                    └── jwt.guard.ts        ← Copy to other services
```

---

## ⭐ Pro Tips

1. **Test First** → Run test-auth.sh before implementing
2. **Copy-Paste Ready** → JWT Guard can be copied as-is
3. **Consistent** → Use same guard in all services
4. **Automatic** → Guard handles all validation
5. **Reusable** → User claims attached to req.user

---

## 📚 Resources

- RFC 7519 (JWT Specification)
- NestJS Guards Documentation
- node-jose Library
- RSA Cryptography Basics

---

**Created:** May 2, 2026
**Project:** CTSE Library Management
**Auth Method:** RSA256 JWT
**Status:** ✅ Ready for Implementation
**Estimated Time to Implement:** 30-45 minutes

**Questions?** → Check the relevant documentation file above
