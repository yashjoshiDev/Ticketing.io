import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
})
export class Ticket extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, min: 0 })
    price: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
