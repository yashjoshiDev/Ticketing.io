import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    // Enable Mongoose's built-in concurrency protection
    optimisticConcurrency: true,
    // Rename __v to 'version' for better clarity in your events
    versionKey: 'version',
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            // Note: We keep 'version' in the JSON so the Gateway/Orders 
            // service can see which version they are working with.
        },
    },
})
export class Ticket extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    userId: string;

    version: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
