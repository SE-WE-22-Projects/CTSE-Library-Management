import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    UserModule,
    HealthModule,
  ],
})
export class AppModule {}
