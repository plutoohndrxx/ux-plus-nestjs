import { RegistryService } from '@/routes/registry/registry.service';
import { RegistryCodeService } from '@/routes/registry-code/registry-code.service';
import { Sequelize } from 'sequelize-typescript';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';
import { ApiResponse } from '@/dto/api-response';
import { RegistryUserDto } from '@/routes/registry/dto/registry.dto';
export const useMockRegisterUser = ({
  registryCodeService,
  sequelize,
  registryService,
  uxJwtService,
  accountInfo,
}: {
  registryCodeService: RegistryCodeService;
  sequelize: Sequelize;
  registryService: RegistryService;
  uxJwtService: UxJwtService;
  accountInfo: RegistryUserDto;
}) => {
  const code = accountInfo.code;
  const email = accountInfo.email;
  const password = accountInfo.password;
  const account = accountInfo.account;
  const clear = async () => {
    const transaction = await sequelize.transaction();
    try {
      await registryCodeService.removeEmailCode(email);
      const r = await registryService.registryModel.findOne({
        where: {
          account,
        },
        attributes: ['id'],
      });
      expect(r).toBeDefined();
      const registryRows = await registryService.registryModel.destroy({
        where: {
          id: r!.id,
        },
      });
      const usersRows = await registryService.usersModel.destroy({
        where: {
          id: r!.id,
        },
      });
      expect(registryRows).toBe(1);
      expect(usersRows).toBe(1);
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      expect(err).toBe('An error occurred while clearing data');
    }
  };
  const enroll = async () => {
    const transaction = await sequelize.transaction();
    try {
      const resultCode = await registryCodeService.insertEmailCode(email, code);
      expect(resultCode).toBe(true);
      const resultUser = await registryService.registryUser({
        account,
        email,
        password,
        code,
      });
      expect(resultUser).toBeInstanceOf(ApiResponse);
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      expect(err).toBe('Error initializing user information');
    }
  };
  const genValidtoken = async () => {
    const result = await registryService.findOne(
      {
        account,
      },
      ['id', 'account', 'secureid'],
    );
    expect(typeof result).toBe('object');
    return uxJwtService.loginToken({
      account: result!.account,
      id: result!.id,
      secureid: result!.secureid,
    });
  };
  return {
    enroll,
    clear,
    genValidtoken,
  };
};
