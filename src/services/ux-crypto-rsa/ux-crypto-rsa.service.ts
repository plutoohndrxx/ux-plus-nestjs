import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'node:path';
@Injectable()
export class UxCryptoRsaService {
  pubkey: string;
  privatekey: string;
  passphrase?: string;
  private readonly logger = new Logger(UxCryptoRsaService.name);
  constructor(private configService: ConfigService) {
    const pubPath = this.configService.get<string>('PUBKEYPATH');
    const privatePath = this.configService.get<string>('PRIVATEKEYPATH');
    const passphrasePath = this.configService.get<string>('PASSPHRASE');
    if (!pubPath || !privatePath) {
      const missingKeys = [] as string[];
      if (!pubPath) missingKeys.push('PUBKEYPATH');
      if (!privatePath) missingKeys.push('PRIVATEKEYPATH');
      const errorMessage = `Missing required environment variable configuration: ${missingKeys.join(', ')}. Please check if the .env file is correctly configured.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      this.pubkey = readFileSync(
        resolve(__dirname, `../../../${pubPath}`),
        'utf-8',
      );
      this.privatekey = readFileSync(
        resolve(__dirname, `../../../${privatePath}`),
        'utf-8',
      );
      if (passphrasePath)
        this.passphrase = readFileSync(
          resolve(__dirname, `../../../${passphrasePath}`),
          'utf-8',
        );
    } catch (err) {
      this.logger.error(`Failed to read the key file: ${err.message}`);
      throw err;
    }
  }
  encrypt(data: string): string {
    return crypto
      .publicEncrypt(
        {
          key: this.pubkey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(data),
      )
      .toString('base64');
  }
  decrypt(encryptedData: string): string {
    return crypto
      .privateDecrypt(
        {
          key: this.privatekey,
          passphrase: this.passphrase,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedData, 'base64'),
      )
      .toString('utf8');
  }
}
