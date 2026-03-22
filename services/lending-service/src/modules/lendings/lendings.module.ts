import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LendingsController } from './lendings.controller';
import { LendingsService } from './lendings.service';
import { Lending, LendingSchema } from './schemas/lending.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lending.name, schema: LendingSchema }]),
  ],
  controllers: [LendingsController],
  providers: [LendingsService],
})
export class LendingsModule {}
