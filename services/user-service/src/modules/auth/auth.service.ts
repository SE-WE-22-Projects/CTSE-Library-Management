import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import * as jose from 'node-jose';
import * as fs from 'node:fs/promises';
import { JWT } from './dto/jwt.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Model } from 'mongoose';
import { LoginRequest } from './dto/login-request.dto';
import { compare, hash } from 'bcrypt';
import { RegisterRequest } from './dto/register-request.dto';

const saltRounds = 10;

@Injectable()
export class AuthService implements OnModuleInit {
  private keystore: jose.JWK.KeyStore;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
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

      return this.signJWT({
        user_id: created._id.toHexString(),
        username: created.username,
        permissions: created.permissions,
        session_id: 'INVALID',
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('duplicate key error')) {
        throw new ConflictException('User with the same email already exists');
      }

      throw e;
    }
  }

  async login(req: LoginRequest) {
    const user = await this.userModel.findOne({ email: req.email });
    if (!user) throw new BadRequestException('Username or password is invalid');

    const correct_password = await compare(req.password, user.password_hashed);
    if (!correct_password)
      throw new BadRequestException('Username or password is invalid');

    return this.signJWT({
      user_id: user._id.toHexString(),
      username: user.username,
      permissions: user.permissions,
      session_id: 'INVALID',
    });
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
      console.error('Error:', error);
    }
  }
}
