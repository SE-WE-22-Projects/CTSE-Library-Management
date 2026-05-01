# Authentication & Authorization Guide

## Architecture Overview

The CTSE Library Management system uses **RSA256 JWT (JSON Web Tokens)** for authentication and authorization across all microservices.

### Authentication Flow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ 1. Send credentials (email, password)
       ▼
┌──────────────────────────────────────────────┐
│  Nginx Gateway (Public Routes ONLY)          │
│  - /api/users/auth/login                     │
│  - /api/users/auth/register                  │
│  - /.well-known/jwks.json                    │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  User Service (Port 3002)                    │
│  - Validates credentials against DB          │
│  - Generates RSA256 signed JWT token         │
│  - Stores JWT signing keys (keys.json)       │
│  - Exposes public keys via JWKS endpoint     │
└──────┬───────────────────────────────────────┘
       │ 2. Returns JWT Token
       │
       ▼
┌──────────────────────────────────────────────┐
│  Frontend                                    │
│  - Stores token (localStorage/sessionStorage)│
│  - Sends in Authorization header             │
└──────┬───────────────────────────────────────┘
       │ 3. Authorization: Bearer <token>
       ▼
┌──────────────────────────────────────────────┐
│  Nginx Gateway (Protected Routes)            │
│  - /api/lendings/*                           │
│  - /api/books/*                              │
│  - /api/notifications/*                      │
│  - /api/users/* (excluding /auth/*)          │
└──────┬───────────────────────────────────────┘
       │ 4. Forward with Authorization header
       ▼
┌──────────────────────────────────────────────┐
│  Backend Services (with JWT Guards)          │
│  - Fetch public keys from user-service JWKS  │
│  - Verify token signature                    │
│  - Check token expiration                    │
│  - Extract user claims (user_id, permissions)│
│  - Allow/Deny request                        │
└──────────────────────────────────────────────┘
```

## JWT Token Structure

### Token Payload
```json
{
  "user_id": "507f1f77bcf86cd799439012",
  "session_id": "INVALID",
  "username": "john_doe",
  "permissions": ["Admin"],
  "exp": 1748520000,
  "iat": 1745928000
}
```

### Token Details
- **Signature Algorithm**: RS256 (RSA SHA-256)
- **Key Size**: 2048-bit RSA key
- **Expiration**: 30 days from creation
- **Issuer**: User Service
- **Format**: JWT compact format (header.payload.signature)

## Authentication Mechanism

### 1. Token Generation (User Service)

**Endpoint**: `POST /api/users/auth/login`

**Request**:
```bash
curl -X POST http://localhost/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@example.com",
    "password": "password123"
  }
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJlOWdkcjUiLCJ0eXAiOiJKV1QifQ.ewogICJpc3MiOiAiaHR0cDovL3NlcnZlci5leGFtcGxlLmNvbSIsCiAgInN1YiI6ICI0NDczOTk0IiwKICAibmFtZSI6ICJKYW5lIERvZSIsCiAgImlhdCI6IDE3NDU5MjgwMDAsCiAgImV4cCI6IDE3NDg1MjAwMDAKfQ.signature"
}
```

### 2. Public Keys Distribution (JWKS)

**Endpoint**: `GET /.well-known/jwks.json`

This endpoint provides the public keys needed to verify JWT tokens:

```bash
curl http://localhost/.well-known/jwks.json
```

**Response**:
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "2e9gdr5",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

### 3. Token Verification in Services

Each backend service validates the JWT token using the public keys from JWKS endpoint.

## Implementation Guide

### Step 1: Add JWT Guard to a Service

To protect a route with JWT authentication, add the `JwtGuard` to your controller:

```typescript
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';

@Controller('api/lendings')
export class LendingsController {
  @UseGuards(JwtGuard)
  @Get()
  async getAll(@Req() req: Request) {
    const userId = req.user.user_id;
    // Your logic here
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateLendingDto) {
    const userId = req.user.user_id;
    // Your logic here
  }
}
```

### Step 2: Copy JWT Guard to Service

Copy the JWT Guard file to your service:
```bash
cp services/user-service/src/common/guards/jwt.guard.ts \
   services/your-service/src/common/guards/
```

### Step 3: Update Module Imports

Ensure your module imports required NestJS and Express types:

```typescript
import { Module } from '@nestjs/common';
import { YourController } from './your.controller';
import { YourService } from './your.service';

@Module({
  imports: [],
  controllers: [YourController],
  providers: [YourService],
})
export class YourModule {}
```

### Step 4: Access User Information

In protected routes, you can access token claims via `req.user`:

```typescript
@UseGuards(JwtGuard)
@Get(':id')
async getById(
  @Param('id') id: string,
  @Req() req: Request
) {
  // Token claims available here
  console.log('User ID:', req.user.user_id);
  console.log('Username:', req.user.username);
  console.log('Permissions:', req.user.permissions);

  // Your logic
}
```

## Public vs Protected Routes

### Public Routes (No JWT Required)
- `POST /api/users/auth/login` - User login
- `POST /api/users/auth/register` - User registration
- `GET /.well-known/jwks.json` - Public key distribution

### Protected Routes (JWT Required)
- `GET /api/lendings/*` - Lending operations
- `POST /api/lendings/*` - Create lending
- `GET /api/books/*` - Book operations
- `GET /api/notifications/*` - Notification operations
- `GET /api/users/*` (excluding /auth) - User operations

## Testing Authentication

### 1. Get Login Token
```bash
curl -X POST http://localhost/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Use Token in Request
```bash
curl -X GET http://localhost/api/lendings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 3. Verify Token Failure
```bash
# Missing token
curl -X GET http://localhost/api/lendings
# Response: 401 Unauthorized - Missing Authorization header

# Invalid token
curl -X GET http://localhost/api/lendings \
  -H "Authorization: Bearer invalid_token"
# Response: 401 Unauthorized - Token signature verification failed

# Expired token
curl -X GET http://localhost/api/lendings \
  -H "Authorization: Bearer EXPIRED_TOKEN"
# Response: 401 Unauthorized - Token expired
```

## Token Validation Flow

1. **Extract Token**: Remove "Bearer " prefix from Authorization header
2. **Verify Signature**: Use JWKS public key to verify RSA256 signature
3. **Check Expiration**: Ensure `exp` claim hasn't passed
4. **Extract Claims**: Get user info from payload
5. **Attach to Request**: Add `req.user` for downstream controllers

## Security Considerations

✅ **Implemented**:
- RSA256 encryption (asymmetric)
- Public/private key separation
- 30-day token expiration
- Bcrypt password hashing
- CORS enabled

⚠️ **Should Consider**:
- Token refresh mechanism (currently no refresh tokens)
- Rate limiting on auth endpoints
- HTTPS enforcement (use in production)
- Logout/token blacklist mechanism
- Session management (session_id currently "INVALID")

## Environment Variables

**User Service (.env)**:
```
PORT=3002
MONGO_URI=mongodb://mongo:27017/library
```

**Other Services (.env)**:
```
PORT=3000
MONGO_URI=mongodb://mongo:27017/library
```

## Troubleshooting

### Token Validation Fails
**Error**: "Token signature verification failed"
- Ensure JWKS endpoint is accessible: `http://user_service:3002/.well-known/jwks.json`
- Verify user-service is running
- Check network connectivity between services

### Missing Authorization Header
**Error**: "Missing Authorization header"
- Ensure you're sending: `Authorization: Bearer <token>`
- Not just sending the token without "Bearer " prefix

### Token Expired
**Error**: "Token expired"
- Login again to get a new token
- Consider implementing token refresh mechanism

### Service Can't Reach JWKS
**Error**: "ECONNREFUSED at user_service:3002"
- Check docker-compose networking
- Verify user-service container is running
- Check service DNS resolution

## References

- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [node-jose Documentation](https://github.com/cisco/node-jose)
- [NestJS Guards](https://docs.nestjs.com/guards)
