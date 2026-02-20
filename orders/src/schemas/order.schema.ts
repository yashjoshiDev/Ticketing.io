import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Ticket } from './ticket.schema';

export enum OrderStatus {
    Created = 'created',
    Cancelled = 'cancelled',
    AwaitingPayment = 'awaiting:payment',
    Complete = 'complete',
}

@Schema({
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
})
export class Order extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created,
    })
    status: OrderStatus;

    @Prop({ type: Date })
    expiresAt: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Ticket' })
    ticket: Ticket;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
