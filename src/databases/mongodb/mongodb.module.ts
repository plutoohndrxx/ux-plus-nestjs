import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EnvConfigModule } from '@/modules/env-config/env-config.module';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [EnvConfigModule],
      useFactory(configService: ConfigService) {
        const r: MongooseModuleFactoryOptions = {
          user: configService.get('MONGODB_USERNAME'),
          pass: configService.get('MONGODB_PASSWORD'),
          autoIndex: true,
          autoCreate: true,
          uri: `mongodb://${configService.get('MONGODB_HOST')}:${configService.get('MONGODB_PORT')}`,
          authSource: 'admin',
        };
        return r;
      },
      inject: [ConfigService],
    }),
  ],
})
export class MongodbModule {}
