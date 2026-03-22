import { ApiProperty } from '@nestjs/swagger';

export class HealthDto {
  @ApiProperty({
    description: 'Sevice status',
  })
  healthy: boolean;

  @ApiProperty({
    description: 'server version',
  })
  version: string;
}
