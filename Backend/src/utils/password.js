import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function createPasswordData(password) {
    const salt = randomBytes(16).toString('hex');
    const passwordHash = scryptSync(password, salt, 64).toString('hex');
    return { passwordSalt: salt, passwordHash };
}

export function passwordMatches(password, passwordSalt, passwordHash) {
    const submittedHash = scryptSync(password, passwordSalt, 64);
    const storedHash = Buffer.from(passwordHash, 'hex');
    return storedHash.length === submittedHash.length
        && timingSafeEqual(storedHash, submittedHash);
}
