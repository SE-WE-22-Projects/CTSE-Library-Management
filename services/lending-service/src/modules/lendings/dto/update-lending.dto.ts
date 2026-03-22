import { PartialType } from '@nestjs/mapped-types';
import { CreateLendingDto } from './create-lending.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { LendingStatus } from '../schemas/lending.schema';

export class UpdateLendingDto extends PartialType(CreateLendingDto) {
  @ApiPropertyOptional({ description: 'Due date in ISO format' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ enum: LendingStatus })
  @IsOptional()
  @IsEnum(LendingStatus)
  status?: LendingStatus;
}
