import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LendingDocument = Lending & Document;

export enum LendingStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

@Schema({ timestamps: true })
export class Lending {
  @Prop({ required: true })
  bookId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  reservedDate: Date;

  @Prop({ required: true })
  returnDate: Date;

  @Prop()
  actualReturnDate?: Date;

  @Prop({ default: 0, min: 0, max: 2 })
  extensionAttempts: number;

  @Prop({ default: 0, min: 0 })
  fineAmount: number;

  @Prop()
  lastFineAppliedDate?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: LendingStatus, default: LendingStatus.ACTIVE })
  status: LendingStatus;
}

export const LendingSchema = SchemaFactory.createForClass(Lending);

LendingSchema.index({ bookId: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
LendingSchema.index({ userId: 1, reservedDate: -1 });
LendingSchema.index({ bookId: 1, reservedDate: -1 });
LendingSchema.index({ isActive: 1, returnDate: 1 });
