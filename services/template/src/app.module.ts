import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      useFactory: databaseConfig,
    }),

    HealthModule,
  ],
})
export class AppModule {}
