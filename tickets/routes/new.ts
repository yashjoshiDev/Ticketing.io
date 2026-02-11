import express, { type Request, type Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.post('/api/tickets', async (req: Request, res: Response) => {
    const { title, price } = req.body;

    // Temporary: We are hardcoding the User ID for now until we copy the Auth middleware
    // In the next step, we will get this from the JWT!
    const fakeUserId = 'user-123-abc';

    const ticket = Ticket.build({
        title,
        price,
        userId: fakeUserId,
    });

    await ticket.save();

    res.status(201).send(ticket);
});

export { router as createTicketRouter };