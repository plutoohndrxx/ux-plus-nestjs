import { forwardRef, Module } from '@nestjs/common';
import { RegistryCodeService } from './registry-code.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { RegistryCode } from '@/databases/mysql-database/model/registry-code.model';
import { RegistryCodeController } from './registry-code.controller';
import { EmailService } from '@/services/email/email.service';
import { UxJwtModule } from '@/modules/ux-jwt/ux-jwt.module';
import { RegistryModule } from '@/routes/registry/registry.module';

@Module({
  imports: [
    SequelizeModule.forFeature([RegistryCode]),
    UxJwtModule,
    forwardRef(() => RegistryModule),
  ],
  providers: [RegistryCodeService, EmailService],
  exports: [RegistryCodeService],
  controllers: [RegistryCodeController],
})
export class RegistryCodeModule {}
