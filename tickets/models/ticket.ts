import mongoose from 'mongoose';

// 1. Describe the properties required to create a new Ticket
interface TicketAttrs {
    title: string;
    price: number;
    userId: string; // We need to know WHO owns this ticket
}

// 2. Describe the properties that a Ticket Document has
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
}

// 3. Describe what the Model itself has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String, // Mongoose type
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    {
        // This transforms the JSON output (e.g., changes _id to id)
        toJSON: {
            transform(doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

// Helper function to enforce Typescript checking
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };