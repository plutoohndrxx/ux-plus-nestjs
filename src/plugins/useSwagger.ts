import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const useSwagger = (app: INestApplication<any>) => {
  if (process.env.NODE_ENV === 'production') return;
  const options = new DocumentBuilder()
    .setTitle('nest-demo example')
    .setDescription('The nest demo API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);
};
