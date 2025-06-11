import { createHash } from 'crypto';

export const md5 = (plaintext: string) =>
  createHash('md5').update(plaintext).digest('hex');
