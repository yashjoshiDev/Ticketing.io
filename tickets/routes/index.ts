import express, { type Request, type Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
    // Find all tickets inside the 'tickets' collection
    const tickets = await Ticket.find({});

    res.send(tickets);
});

export { router as indexTicketRouter };