import { HttpStatus } from '@nestjs/common';
import { ValidateDtoException } from './validate-dto.exception';

describe('ValidateDtoException', () => {
  const testStatus = HttpStatus.BAD_REQUEST;
  const testMessage = 'Validation failed';
  const testErrors = ['Invalid field 1', 'Invalid field 2'];

  const dtoData = {
    status: testStatus,
    message: testMessage,
    errors: testErrors,
  };

  it('should correctly initialize selfError', () => {
    const exception = new ValidateDtoException(dtoData);
    expect(exception.selfError).toEqual(dtoData);
  });

  it('should return correct response structure', () => {
    const exception = new ValidateDtoException(dtoData);
    const response = exception.getResponse();

    expect(response).toEqual({
      status: testStatus,
      errors: testErrors,
    });
  });

  it('should return correct HTTP status code', () => {
    const exception = new ValidateDtoException(dtoData);
    expect(exception.getStatus()).toBe(testStatus);
  });
});
