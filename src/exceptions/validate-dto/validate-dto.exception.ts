import { HttpStatus, HttpException } from '@nestjs/common';

export class ValidateDtoException extends HttpException {
  selfError: {
    status: HttpStatus;
    message: string;
    errors: string[];
  };
  constructor(d: { status: HttpStatus; errors: string[]; message: string }) {
    super(
      {
        status: d.status,
        errors: d.errors,
      },
      d.status,
      {
        cause: d.message,
      },
    );
    this.selfError = {
      status: d.status,
      message: d.message,
      errors: d.errors,
    };
  }
}
