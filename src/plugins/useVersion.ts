import { INestApplication, VersioningType } from '@nestjs/common';
export const useVersion = (app: INestApplication<any>) => {
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });
};
