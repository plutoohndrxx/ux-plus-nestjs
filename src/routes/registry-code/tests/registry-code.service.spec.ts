/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule, getModelToken } from '@nestjs/sequelize';
import { MysqlDatabaseModule } from '@/databases/mysql-database/mysql-database.module';
import { RegistryCodeService } from '@/routes/registry-code/registry-code.service';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';
import { RegistryCode } from '@/databases/mysql-database/model/registry-code.model';
import { UxJwtModule } from '@/modules/ux-jwt/ux-jwt.module';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { Op } from 'sequelize';
describe('RegistryCodeService (Integration)', () => {
  let service: RegistryCodeService;
  let uxJwtService: UxJwtService;
  let sequelize: Sequelize;
  let registryCodeModel: typeof RegistryCode;
  const testData = {
    email: [
      'test@example.com',
      'update@example.com',
      'notfound@example.com',
      'wrongcode@example.com',
      'valid@example.com',
    ],
  };
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MysqlDatabaseModule,
        SequelizeModule.forFeature([RegistryCode]),
        UxJwtModule,
      ],
      providers: [RegistryCodeService],
    }).compile();

    service = module.get<RegistryCodeService>(RegistryCodeService);
    uxJwtService = module.get<UxJwtService>(UxJwtService);
    registryCodeModel = module.get<typeof RegistryCode>(
      getModelToken(RegistryCode),
    );
    sequelize = module.get<Sequelize>(Sequelize);
  });

  const clear = async () => {
    await registryCodeModel.destroy({
      where: {
        email: {
          [Op.or]: testData.email,
        },
      },
    });
  };

  // beforeEach(async () => {
  //   await clear();
  // });

  afterAll(async () => {
    await clear();
    await sequelize.close();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(uxJwtService).toBeDefined();
  });

  describe('insertEmailCode', () => {
    it('should insert a new email code into the database', async () => {
      const email = testData.email[0];
      const code = '123456';
      try {
        const result = await service.insertEmailCode(email, code);
        expect(result).toBe(true);
      } catch (err) {
        expect(err).toBe('error');
      }
    });
    it('should update existing email code', async () => {
      const email = testData.email[1];
      const code1 = '123456';
      const code2 = '654321';

      await service.insertEmailCode(email, code1);

      await service.insertEmailCode(email, code2);

      const record = await registryCodeModel.findOne({ where: { email } });
      expect(record).toBeDefined();

      const decoded = uxJwtService.parseCode(record!.code);
      expect(decoded.data).toBe(code2);
    });
  });

  describe('verifyRegistryCode', () => {
    it('should throw error if no code exists for the email', async () => {
      const email = testData.email[2];
      const code = '123456';
      try {
        await service.verifyRegistryCode(email, code);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('Please obtain the verification code first');
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw error if code does not match stored value', async () => {
      const email = testData.email[3];
      const storedCode = 'correct123';
      const inputCode = 'wrong123';
      await service.insertEmailCode(email, storedCode);
      try {
        await service.verifyRegistryCode(email, inputCode);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('The verification code is incorrect');
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return success if code matches', async () => {
      const email = testData.email[4];
      const code = '123456';

      await service.insertEmailCode(email, code);

      const result = await service.verifyRegistryCode(email, code);

      expect(result.code).toBe(HttpStatus.OK);
      expect(result.message).toBe('Verification code validated successfully');
    });
  });

  describe('removeEmailCode', () => {
    it('should delete the user successfully', async () => {
      const email = 'xxxx66@qq.com';
      const code = '123456';
      const r = await service.insertEmailCode(email, code);
      expect(r).toBe(true);
      const r2 = await service.removeEmailCode(email);
      expect(r2).toBe(true);
    });

    it('the deletion should fail when the resource does not exist', async () => {
      const email = 'notfound@qq.com';
      const r = await service.removeEmailCode(email);
      expect(r).toBe(false);
    });
  });
});
