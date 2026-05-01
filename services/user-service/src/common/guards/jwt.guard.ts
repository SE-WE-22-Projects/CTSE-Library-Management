import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jose from 'node-jose';
import * as http from 'http';

/**
 * JWT Guard for validating Bearer tokens
 * Validates tokens against the user-service JWKS endpoint
 *
 * Usage in a controller:
 * @UseGuards(JwtGuard)
 * @Get('protected-route')
 * async getProtected(@Req() req: Request) {
 *   // User info available in req.user
 *   return { userId: req.user.user_id };
 * }
 */
@Injectable()
export class JwtGuard implements CanActivate {
  private keystore: jose.JWK.KeyStore | null = null;
  private lastFetched = 0;
  private cacheDuration = 3600000; // 1 hour

  async getJwks(): Promise<jose.JWK.KeyStore> {
    const now = Date.now();

    // Use cached keystore if recent
    if (this.keystore && now - this.lastFetched < this.cacheDuration) {
      return this.keystore;
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'user_service',
        port: 3002,
        path: '/.well-known/jwks.json',
        method: 'GET',
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', async () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`JWKS endpoint returned ${res.statusCode}`));
              return;
            }

            const jwksData = JSON.parse(data);
            this.keystore = await jose.JWK.asKeyStore(jwksData);
            this.lastFetched = now;
            resolve(this.keystore);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid Authorization header format. Use: Bearer <token>',
      );
    }

    const token = parts[1];

    try {
      const keystore = await this.getJwks();
      const jwt = require('jsonwebtoken');

      // Decode without verification first to get kid
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Get the correct key from keystore
      const keys = keystore.all();
      let verified = null;

      for (const key of keys) {
        try {
          const verifier = jose.JWS.createVerify(keystore, key);
          verified = await verifier.verify(token);
          break;
        } catch (e) {
          // Try next key
          continue;
        }
      }

      if (!verified) {
        throw new UnauthorizedException('Token signature verification failed');
      }

      const payload = JSON.parse(verified.payload.toString());

      // Check expiration
      if (payload.exp) {
        if (payload.exp < Math.floor(Date.now() / 1000)) {
          throw new UnauthorizedException('Token expired');
        }
      }

      // Attach user info to request
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('JWT validation error:', error);
      throw new UnauthorizedException(
        `Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

// Extending Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        session_id: string;
        username: string;
        permissions: string[];
        exp: number;
        iat: number;
      };
    }
  }
}
