import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwkController } from './jwk.controller';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService],
  controllers: [JwkController, AuthController],
})
export class AuthModule {}
