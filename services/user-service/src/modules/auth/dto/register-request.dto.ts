import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @MinLength(5)
  username: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
