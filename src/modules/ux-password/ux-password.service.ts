import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { UxCryptoRsaService } from '@/services/ux-crypto-rsa/ux-crypto-rsa.service';
import { md5 } from '@/tools';

@Injectable()
export class UxPasswordService {
  constructor(
    @Inject(forwardRef(() => UxCryptoRsaService))
    private readonly uxCryptoRsaService: UxCryptoRsaService,
  ) {}
  encryptedPassword(plainText: string) {
    const ep1 = md5(plainText);
    return this.uxCryptoRsaService.encrypt(ep1);
  }
  verifyPassword(encryptPwd: string, encryptPwd2: string) {
    const p1 = this.uxCryptoRsaService.decrypt(encryptPwd);
    const p2 = md5(this.uxCryptoRsaService.decrypt(encryptPwd2));
    return p1 === p2;
  }
}
