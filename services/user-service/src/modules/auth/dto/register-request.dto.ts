import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @MinLength(5)
  username: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(4, 10)
  password: string;
}
