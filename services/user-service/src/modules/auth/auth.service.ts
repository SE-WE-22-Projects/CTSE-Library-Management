import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as jose from 'node-jose';
import * as fs from 'node:fs/promises';
import { JWT } from './dto/jwt.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Model } from 'mongoose';
import { LoginRequest } from './dto/login-request.dto';
import { compare, hash } from 'bcrypt';
import { RegisterRequest } from './dto/register-request.dto';
import { LoginResponse } from './dto/login-response.dto';

const saltRounds = 10;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private keystore: jose.JWK.KeyStore;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
  ) {}

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

  async register(req: RegisterRequest) {
    const password_hashed = await hash(req.password, saltRounds);

    const user = new this.userModel({
      ...req,
      password: undefined,
      password_hashed,
    });

    try {
      const created = await user.save();

      const tokenBuffer = await this.signJWT({
        user_id: created._id.toHexString(),
        username: created.username,
        permissions: created.permissions,
        session_id: 'INVALID',
      });
      
      const tokenStr = tokenBuffer!.toString();

      // Fire and forget welcome email
      this.sendWelcomeNotification(created.email, tokenStr).catch(e => this.logger.error('Welcome email failed', e.stack));

      return tokenStr;
    } catch (e) {
      if (e instanceof Error && e.message.includes('duplicate key error')) {
        throw new ConflictException('User with the same email already exists');
      }

      throw e;
    }
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ email: req.email });
    if (!user) throw new BadRequestException('Username or password is invalid');

    const correct_password = await compare(req.password, user.password_hashed);
    if (!correct_password)
      throw new BadRequestException('Username or password is invalid');

    const token = this.signJWT({
      user_id: user._id.toHexString(),
      username: user.username,
      permissions: user.permissions,
      session_id: 'INVALID',
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      token: (await token)!.toString(),
      user: { ...user.toObject(), password_hashed: undefined },
    };
  }

  async validate(tokenStr: string) {
    const jwk = this.keystore.all({ use: 'sig' })[0];

    const verifier = jose.JWS.createVerify(jwk, {
      algorithms: ['RS256'],
    });

    try {
      await verifier.verify(tokenStr);
      return true;
    } catch (e) {
      this.logger.error(`Invalid token`, e.stack);
      return false;
    }
  }

  private async signJWT(claims: JWT) {
    try {
      const jwk = this.keystore.all({ use: 'sig' })[0];

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
      this.logger.error('Error signing JWT', error.stack);
    }
  }

  private async sendWelcomeNotification(email: string, token: string): Promise<void> {
    const gatewayUrl = process.env['GATEWAY_URL'];
    if (!gatewayUrl) {
      this.logger.warn('GATEWAY_URL is not configured. Cannot send welcome email.');
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          `${gatewayUrl}/api/notification/`,
          {
            recipient: email,
            subject: 'Welcome to CTSE Library',
            content: 'Thank you for registering at the CTSE Library Management System! Your account is now active.',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
    } catch (error) {
      this.logger.error('Failed to send welcome email via gateway', error.stack);
    }
  }
}
