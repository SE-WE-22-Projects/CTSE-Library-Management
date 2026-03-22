import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationSettingsDocument = NotificationSettings & Document;

@Schema({ timestamps: true })
export class NotificationSettings {
  @Prop({ required: true, unique: true })
  userId: string; // Or "global" if it's a global setting

  @Prop({ default: true })
  emailEnabled: boolean;

  @Prop({ default: true })
  promotionalEmails: boolean;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettings);
