import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ example: 'user123', description: 'The user ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: true, description: 'Enable/disable email notifications' })
  @IsBoolean()
  emailEnabled: boolean;

  @ApiProperty({ example: false, description: 'Enable/disable promotional emails' })
  @IsBoolean()
  promotionalEmails: boolean;
}
