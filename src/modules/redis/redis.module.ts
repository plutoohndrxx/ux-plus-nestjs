import { Module, Global } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';
import { EnvConfigModule } from '@/modules/env-config/env-config.module';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [EnvConfigModule],
      useFactory(configService: ConfigService) {
        return {
          type: 'single',
          url: `redis://${configService.get('REDIS_HOST')}:${+configService.get('REDIS_PORT')!}`,
          // options: {
          //   // host: configService.get('REDIS_HOST'),
          //   // port: +configService.get('REDIS_PORT')!,
          //   host: '127.0.0.1',
          //   port: 6379,
          // },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
