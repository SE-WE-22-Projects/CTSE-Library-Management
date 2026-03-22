import { Injectable, OnModuleInit } from '@nestjs/common';
import * as jose from 'node-jose';
import * as fs from 'node:fs/promises';
import { JWT } from './dto/jwt.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private keystore: jose.JWK.KeyStore;

  async onModuleInit() {
    try {
      const keys = await fs.readFile('./keys.json');
      this.keystore = await jose.JWK.asKeyStore(keys);
    } catch {
      this.keystore = jose.JWK.createKeyStore();
      await this.keystore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });

      await fs.writeFile(
        './keys.json',
        JSON.stringify(this.keystore.toJSON(true)),
      );
    }
  }

  getJwks() {
    return this.keystore.toJSON();
  }

  getSigningKey() {
    return this.keystore.all({ use: 'sig' })[0];
  }

  async signJWT(claims: JWT) {
    try {
      const jwk = this.getSigningKey();
      const signer = jose.JWS.createSign(
        { alg: 'RS256', format: 'compact' },

        jwk,
      );

      const content = JSON.stringify({
        ...claims,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      });

      const result = await signer.update(content).final();

      return result;
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
