import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OrderStatus {
  Created = 'created',
  Cancelled = 'cancelled',
  AwaitingPayment = 'awaiting:payment',
  Complete = 'complete',
}

@Schema({
  toJSON: {
    transform(_doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Order extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, enum: Object.values(OrderStatus) })
  status: OrderStatus;

  @Prop({ type: Date })
  expiresAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
