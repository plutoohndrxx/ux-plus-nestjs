import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, RegistryCode, Users, Registry } from './model';
import { ConfigService } from '@nestjs/config';
import { EnvConfigModule } from '@/modules/env-config/env-config.module';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [EnvConfigModule],
      useFactory(configService: ConfigService) {
        return {
          dialect: 'mysql',
          host: configService.get('MYSQL_HOST'),
          port: +configService.get('MYSQL_PORT')!,
          username: configService.get('MYSQL_USERNAME'),
          password: configService.get('MYSQL_PASSWORD'),
          database: configService.get('MYSQL_DATABASE'),
          models: [Test, Registry, Users, RegistryCode],
          synchronize: true,
          define: {
            timestamps: false,
            freezeTableName: true,
          },
          logging: ['test', 'production'].includes(process.env.NODE_ENV!)
            ? false
            : true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [SequelizeModule],
})
export class MysqlDatabaseModule {
  constructor() {}
}
