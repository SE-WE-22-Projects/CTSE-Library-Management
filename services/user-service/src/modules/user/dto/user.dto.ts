import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { User } from 'src/schema/user.schema';

export class UserDto {
  static from(v: User & { _id: mongoose.Types.ObjectId }): UserDto {
    return {
      _id: v._id.toHexString(),
      email: v.email,
      username: v.username,
      permissions: v.permissions,
    };
  }

  @ApiProperty()
  _id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  permissions: Array<string>;
}
