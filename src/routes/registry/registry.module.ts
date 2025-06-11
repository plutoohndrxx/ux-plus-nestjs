import { Module } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Registry } from '../../databases/mysql-database/model/registry.model';
import { Users } from '../../databases/mysql-database/model/users.model';
import { RegistryController } from './registry.controller';
import { EmailService } from '../../services/email/email.service';
import { RegistryCodeModule } from '../registry-code/registry-code.module';
import { UxPasswordModule } from '@/modules/ux-password/ux-password.module';
import { UxCryptoRsaService } from '@/services/ux-crypto-rsa/ux-crypto-rsa.service';
@Module({
  imports: [
    SequelizeModule.forFeature([Registry, Users]),
    RegistryCodeModule,
    UxPasswordModule,
  ],
  providers: [RegistryService, EmailService, UxCryptoRsaService],
  controllers: [RegistryController],
  exports: [RegistryService],
})
export class RegistryModule {}
