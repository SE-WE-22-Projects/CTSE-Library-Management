import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Permission } from './permisson.enum';

export type UserDocument = User & mongoose.Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hashed: string;

  @Prop({ required: true })
  username: string;

  @Prop({
    type: [{ type: String, enum: Object.values(Permission) }],
  })
  permissions: Array<Permission>;
}

export const UserSchema = SchemaFactory.createForClass(User);
