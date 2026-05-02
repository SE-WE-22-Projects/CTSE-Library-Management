import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { LendingsController } from './lendings.controller';
import { LendingsService } from './lendings.service';
import { Lending, LendingSchema } from './schemas/lending.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lending.name, schema: LendingSchema }]),
    HttpModule,
  ],
  controllers: [LendingsController],
  providers: [LendingsService],
})
export class LendingsModule {}
