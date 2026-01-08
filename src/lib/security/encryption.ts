import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const FALLBACK_SECRET = 'cfabric-safe-vault-2026';
const SECRET_KEY = process.env.ENCRYPTION_SECRET || FALLBACK_SECRET;

function getKey(projectId: string): Buffer {
    // Derive a 32-byte key from the secret and project ID
    return createHash('sha256').update(`${SECRET_KEY}-${projectId}`).digest();
}

/**
 * Encrypts a string using AES-256-CBC (Native Node.js).
 * Format: iv:ciphertext (hex encoded)
 */
export function encryptToken(text: string, projectId: string): string {
    const key = getKey(projectId);
    const iv = randomBytes(16); // AES-256-CBC needs 16-byte IV
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string using AES-256-CBC (Native Node.js).
 */
export function decryptToken(encryptedFull: string, projectId: string): string {
    const [ivHex, encryptedText] = encryptedFull.split(':');
    if (!ivHex || !encryptedText) throw new Error('Invalid encrypted format');

    const key = getKey(projectId);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
