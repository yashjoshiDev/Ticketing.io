import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Password } from './services/password';
import cookieSession from 'cookie-session';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();

// 1. Trust traffic from Nginx/Proxies (Important for K8s later)
app.set('trust proxy', true);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// 2. Configure Cookie Session
app.use(
    cookieSession({
        signed: false, // Turn off encryption (JWT is already tamper-proof)
        secure: false, // Set to TRUE when we go to HTTPS/Production
    })
);

// --- SIGN UP ROUTE (Prisma Version) ---
app.post('/signup', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await Password.toHash(password);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });

        // --- NEW: Generate JWT ---
        const userJwt = jwt.sign(
            { id: user.id, email: user.email },
            'asdf' // <--- "Secret Key". In production, use process.env.JWT_KEY
        );

        // --- NEW: Store it on the Session Object ---
        req.session = { jwt: userJwt };

        res.status(201).json({ message: 'User created & Logged In!', user });

    } catch (err: any) {
        if (err.code === 'P2002') {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            console.error(err);
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
});

// --- SIGN IN ROUTE ---
app.post('/signin', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 1. Find user by email
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (!existingUser) {
        // Generic error message is safer for security
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare passwords
    const passwordsMatch = await Password.compare(
        existingUser.password,
        password
    );

    if (!passwordsMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT (Same as signup)
    const userJwt = jwt.sign(
        { id: existingUser.id, email: existingUser.email },
        'asdf'
    );

    // 4. Store in Session
    req.session = { jwt: userJwt };

    res.status(200).json({ message: 'Login successful!', existingUser });
});

app.get('/api/users/currentuser', (req: Request, res: Response) => {
    // If there is no session or no JWT, return null
    if (!req.session?.jwt) {
        return res.send({ currentUser: null });
    }

    try {
        // Verify the token
        const payload = jwt.verify(req.session.jwt, 'asdf');
        res.send({ currentUser: payload });
    } catch (err) {
        res.send({ currentUser: null });
    }
});

app.listen(4000, () => {
    console.log('Auth Service running on http://localhost:4000');
});