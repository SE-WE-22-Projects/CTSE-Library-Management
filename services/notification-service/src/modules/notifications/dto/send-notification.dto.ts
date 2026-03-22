import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({ example: 'user@example.com', description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ example: 'Welcome to our service', description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Hello, welcome to our platform...', description: 'Email content' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
