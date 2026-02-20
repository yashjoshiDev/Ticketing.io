import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
    static async toHash(password: string): Promise<string> {
        const salt = randomBytes(8).toString('hex');
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${salt}.${buf.toString('hex')}`;
    }

    static async compare(
        storedPassword: string,
        suppliedPassword: string,
    ): Promise<boolean> {
        const [salt, storedHash] = storedPassword.split('.');
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
        return buf.toString('hex') === storedHash;
    }
}
