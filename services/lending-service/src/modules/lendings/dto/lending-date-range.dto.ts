import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class LendingDateRangeDto {
  @ApiProperty({ description: 'Inclusive start date in ISO format' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Inclusive end date in ISO format' })
  @IsDateString()
  endDate: string;
}
