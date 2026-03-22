import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwkController } from './jwk.controller';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';

@Module({
  providers: [AuthService],
  controllers: [JwkController, AuthController],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class AuthModule {}
