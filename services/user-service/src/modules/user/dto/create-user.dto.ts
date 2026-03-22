import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Permission } from 'src/schema/permisson.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @MinLength(5)
  username: string;

  @ApiProperty({ enum: Permission, isArray: true })
  @IsEnum(Permission, { each: true })
  permission: Permission;
}
