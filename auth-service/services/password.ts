import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
    static async toHash(password: string): Promise<string> {
        // 1. Generate a random 'salt' (extra security)
        const salt = randomBytes(8).toString('hex');

        // 2. Hash the password combined with the salt
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;

        // 3. Return as 'salt.hash' so we can verify it later
        return `${salt}.${buf.toString('hex')}`;
    }

    static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
        // 1. Split the stored password back into salt and hash
        const [salt, storedHash] = storedPassword.split('.');

        if (!salt || !storedHash) {
            throw new Error('Invalid stored password format');
        }

        // 2. Hash the user's input using the SAME salt
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

        // 3. Compare the result
        return buf.toString('hex') === storedHash;
    }
}