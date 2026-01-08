import CryptoJS from 'crypto-js';

const FALLBACK_SECRET = 'cfabric-safe-vault-2026';
const SECRET_KEY = process.env.ENCRYPTION_SECRET || FALLBACK_SECRET;

/**
 * Encrypts a string using AES encryption and a project-specific salt.
 * @param text The plain text to encrypt
 * @param projectId Optional project ID to use as extra salt
 */
export function encryptToken(text: string, projectId: string): string {
    // We combine the global secret with the project ID for project-specific encryption
    const dynamicKey = `${SECRET_KEY}-${projectId}`;
    return CryptoJS.AES.encrypt(text, dynamicKey).toString();
}

/**
 * Decrypts a string using AES encryption and a project-specific salt.
 * @param ciphertext The encrypted text to decrypt
 * @param projectId The project ID used during encryption
 */
export function decryptToken(ciphertext: string, projectId: string): string {
    const dynamicKey = `${SECRET_KEY}-${projectId}`;
    const bytes = CryptoJS.AES.decrypt(ciphertext, dynamicKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}
