import { Module } from '@nestjs/common';
import { UxPasswordService } from './ux-password.service';
import { UxCryptoRsaService } from '@/services/ux-crypto-rsa/ux-crypto-rsa.service';

@Module({
  providers: [UxCryptoRsaService, UxPasswordService],
  exports: [UxPasswordService],
})
export class UxPasswordModule {}
