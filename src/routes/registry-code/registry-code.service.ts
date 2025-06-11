import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegistryCode } from '../../databases/mysql-database/model/registry-code.model';
import { InjectModel } from '@nestjs/sequelize';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';

@Injectable()
export class RegistryCodeService {
  constructor(
    @InjectModel(RegistryCode)
    public registryCode: typeof RegistryCode,
    private readonly uxJwtService: UxJwtService,
  ) {}

  /**
   * Verify the email and verification code
   *
   * @async
   * @param {string} email
   * @param {string} plainCode
   * @returns {{
   *   code:number
   *   message:string
   * }}
   */
  async verifyRegistryCode(email: string, plainCode: string) {
    const r = await this.registryCode.findOne({
      where: {
        email,
      },
    });
    if (!r)
      throw new HttpException(
        'Please obtain the verification code first',
        HttpStatus.BAD_REQUEST,
      );
    const { data, err } = this.uxJwtService.parseCode(r.code);
    if (err) throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    if (data !== plainCode)
      throw new HttpException(
        'The verification code is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    return {
      code: HttpStatus.OK,
      message: 'Verification code validated successfully',
    };
  }
  async insertEmailCode(email: string, code: string) {
    const enCode = this.uxJwtService.enCode(code);
    const [, isExist] = await this.registryCode.findOrCreate({
      where: { email },
      defaults: { code: enCode, email },
    });
    if (isExist) return true;
    const [effect] = await this.registryCode.update(
      {
        code: enCode,
      },
      {
        where: {
          email: email,
        },
      },
    );
    if (effect === 1) return true;
    return false;
  }
  async removeEmailCode(email: string) {
    const effectRows = await this.registryCode.destroy({
      where: {
        email,
      },
    });
    return effectRows === 1;
  }
}
