import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    transform(_doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Payment extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  stripeId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
