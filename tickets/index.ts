import express from 'express';
import mongoose from 'mongoose'; // <--- Import Mongoose
import cookieSession from 'cookie-session';
import { createTicketRouter } from './routes/new';
import { indexTicketRouter } from './routes/index';

const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: false,
    })
);

app.use(createTicketRouter);
app.use(indexTicketRouter);

// --- NEW: Database Connection Function ---
const start = async () => {
    try {
        // Connect to MongoDB Container running on localhost:27017
        // The '/tickets' at the end will automatically create a new DB named 'tickets'
        await mongoose.connect('mongodb://localhost:27017/tickets');
        console.log('🌱 Connected to MongoDB');
    } catch (err) {
        console.error(err);
    }

    app.listen(5000, () => {
        console.log('🎫 Tickets Service listening on port 5000');
    });
};

// Start the server
start();