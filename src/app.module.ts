import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MysqlDatabaseModule } from './databases/mysql-database/mysql-database.module';
import { AuthModule } from './routes/auth/auth.module';
import { UxCryptoRsaService } from './services/ux-crypto-rsa/ux-crypto-rsa.service';
import { UxJwtModule } from './modules/ux-jwt/ux-jwt.module';
import { RegistryModule } from './routes/registry/registry.module';
import { RegistryCodeModule } from './routes/registry-code/registry-code.module';
import { EmailService } from './services/email/email.service';
import { HttpExceptionFilter } from './filter';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  HttpAdapterHost,
} from '@nestjs/core';
import { RedisModule } from './modules/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CpuOverloadProtectionService } from './modules/cpu-overload-protection/cpu-overload-protection.service';
import { StoreModule } from './modules/store/store.module';
import { IsProvideServiceGuard } from './guards';
import { XssSanitizeInterceptor } from './interceptors';
import { MongodbModule } from './databases/mongodb/mongodb.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { EnvConfigModule } from './modules/env-config/env-config.module';
import { UxPasswordModule } from './modules/ux-password/ux-password.module';
const staticPath = join(__dirname, '../static');

const useProviders = () => {
  const data = [
    CpuOverloadProtectionService,
    {
      provide: APP_GUARD,
      useClass: IsProvideServiceGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: XssSanitizeInterceptor,
    },
    AppService,
    UxCryptoRsaService,
    EmailService,
    HttpAdapterHost,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ];
  const testData = [
    {
      provide: APP_INTERCEPTOR,
      useClass: XssSanitizeInterceptor,
    },
    AppService,
    UxCryptoRsaService,
    EmailService,
    HttpAdapterHost,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ];
  return process.env.NODE_ENV === 'test' ? testData : data;
};

@Module({
  imports: [
    EnvConfigModule,
    ServeStaticModule.forRoot({
      rootPath: staticPath,
      renderPath: '/static',
    }),
    ScheduleModule.forRoot(),
    UxJwtModule,
    MysqlDatabaseModule,
    AuthModule,
    RegistryCodeModule,
    RedisModule,
    RegistryModule,
    StoreModule,
    MongodbModule,
    UxPasswordModule,
  ],
  controllers: [AppController],
  providers: useProviders(),
})
export class AppModule {}
