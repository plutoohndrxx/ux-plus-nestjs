import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidateDtoException } from '@/exceptions';

export const useValidationPipe = (app: INestApplication<any>) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Throw an exception if the request contains properties not defined in the DTO
      transform: true, // Automatically transform the request body into the target DTO type
      enableDebugMessages: process.env.NODE_ENV === 'production' ? true : false,
      exceptionFactory(errors) {
        const messages = errors.map((error) => {
          if (error.constraints) {
            return Object.values(error.constraints).join(', ');
          }
          return `${error.property} Validation failed`;
        });
        return new ValidateDtoException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid parameters',
          errors: messages,
        });
      },
    }),
  );
};
