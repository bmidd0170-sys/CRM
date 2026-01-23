import crypto from 'crypto';

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const ENCODING = 'hex';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString(ENCODING);
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString(ENCODING);
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, storedKey] = stored.split(':');
    if (!salt || !storedKey) return false;
    const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString(ENCODING);
    const storedBuffer = Buffer.from(storedKey, ENCODING);
    const derivedBuffer = Buffer.from(derivedKey, ENCODING);
    if (storedBuffer.length !== derivedBuffer.length) return false;
    return crypto.timingSafeEqual(storedBuffer, derivedBuffer);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}
