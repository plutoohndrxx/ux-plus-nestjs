import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UxJwtModule } from '@/modules/ux-jwt/ux-jwt.module';
import { RegistryModule } from '@/routes/registry/registry.module';
import { UxPasswordModule } from '@/modules/ux-password/ux-password.module';
import { UxCryptoRsaService } from '@/services/ux-crypto-rsa/ux-crypto-rsa.service';
@Module({
  imports: [UxJwtModule, RegistryModule, UxPasswordModule],
  controllers: [AuthController],
  providers: [AuthService, UxCryptoRsaService],
})
export class AuthModule {}
