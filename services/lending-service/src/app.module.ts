import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { LendingsModule } from './modules/lendings/lendings.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      useFactory: databaseConfig,
    }),

    HealthModule,
    LendingsModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
