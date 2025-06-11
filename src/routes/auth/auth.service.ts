import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegistryService } from '@/routes/registry/registry.service';
import { UxPasswordService } from '@/modules/ux-password/ux-password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly registryService: RegistryService,
    private readonly uxPasswordService: UxPasswordService,
  ) {}

  /**
   * validate account and password
   *
   * @async
   * @param {string} account
   * @param {string} enPassword
   * @returns {Registry}
   */
  async validateCredentials(account: string, enPassword: string) {
    try {
      const result = await this.registryService.fromAccountToUser(account, [
        'id',
        'password',
        'account',
        'secureid',
      ]);
      if (!result)
        throw new HttpException(
          'Account does not exist',
          HttpStatus.BAD_REQUEST,
        );

      const isPass = this.uxPasswordService.verifyPassword(
        result.password,
        enPassword,
      );
      if (!isPass)
        throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
      return result;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
