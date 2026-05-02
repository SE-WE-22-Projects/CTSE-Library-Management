import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAvailabilityDto {
  @ApiProperty({ description: 'Book availability flag' })
  @IsBoolean()
  isAvailable: boolean;
}