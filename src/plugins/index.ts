import { useValidationPipe } from './useValidationPipe';
import { useRateLimit } from './useRateLimit';
import { useVersion } from './useVersion';
import { INestApplication } from '@nestjs/common';
import { useSwagger } from './useSwagger';

export const setupPlugins = (app: INestApplication<any>) => {
  [useValidationPipe, useRateLimit, useVersion, useSwagger].forEach((use) =>
    use(app),
  );
};
