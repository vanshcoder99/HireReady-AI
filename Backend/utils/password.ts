import crypto from 'crypto';

/**
 * Hashes a plaintext password using PBKDF2 with a cryptographically secure random salt.
 * Output format: <salt_hex>:<hash_hex>
 */
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Verifies a plaintext password against a stored salt:hash string using constant-time comparison.
 */
export const verifyPassword = (password: string, storedHash: string): boolean => {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    const originalBuffer = Buffer.from(originalHash, 'hex');
    if (hashBuffer.length !== originalBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuffer, originalBuffer);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
};
