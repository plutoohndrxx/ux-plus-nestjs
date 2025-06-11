import { Test, TestingModule } from '@nestjs/testing';
import { RegistryService } from '../registry.service';
import { RegistryCodeService } from '@/routes/registry-code/registry-code.service';
import { UxPasswordService } from '@/modules/ux-password/ux-password.service';
import { MysqlDatabaseModule } from '@/databases/mysql-database/mysql-database.module';
import { HttpException, HttpStatus } from '@nestjs/common';
import { useMockRegisterUser } from '@/test-tools';
import { Sequelize } from 'sequelize-typescript';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';
import { RegistryUserDto } from '@/routes/registry/dto/registry.dto';
import { ApiResponse } from '@/dto/api-response';
import { generateId } from '@/tools';
import { RegistryModule } from '../registry.module';
describe('RegistryService', () => {
  let service: RegistryService;
  let registryCodeService: RegistryCodeService;
  let sequelize: Sequelize;
  let uxJwtService: UxJwtService;
  let uxPasswordService: UxPasswordService;
  let enroll: ReturnType<typeof useMockRegisterUser>['enroll'];
  let clear: ReturnType<typeof useMockRegisterUser>['clear'];
  const accountInfo: RegistryUserDto = {
    account: 'testuser30',
    email: 'xxxxx@qq.com',
    password: '123456',
    code: '777777',
  };
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MysqlDatabaseModule,
        // SequelizeModule.forFeature([Registry, Users]),
        // forwardRef(() => RegistryCodeModule),
        // UxPasswordModule,
        RegistryModule,
      ],
      // providers: [RegistryService, EmailService, UxCryptoRsaService],
    }).compile();
    service = module.get<RegistryService>(RegistryService);
    registryCodeService = module.get<RegistryCodeService>(RegistryCodeService);
    uxJwtService = module.get<UxJwtService>(UxJwtService);
    sequelize = module.get<Sequelize>(Sequelize);
    uxPasswordService = module.get<UxPasswordService>(UxPasswordService);
    const p = useMockRegisterUser({
      registryCodeService,
      sequelize,
      registryService: service,
      uxJwtService,
      accountInfo,
    });
    enroll = p.enroll;
    clear = p.clear;
  });

  beforeAll(async () => {
    await enroll();
  });

  afterAll(async () => {
    await clear();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(registryCodeService).toBeDefined();
    expect(uxJwtService).toBeDefined();
    expect(sequelize).toBeDefined();
    expect(uxPasswordService).toBeDefined();
  });
  describe('registryUser', () => {
    it('should register a new user successfully', async () => {
      const transaction = await sequelize.transaction();
      const localAccountInfo: RegistryUserDto = {
        email: 'xxxjlajagagafafgla1@qq.com',
        code: '888888',
        password: '123456',
        account: 'uuuuu',
      };
      try {
        const resultCode = await registryCodeService.insertEmailCode(
          localAccountInfo.email,
          localAccountInfo.code,
        );
        expect(resultCode).toBe(true);
        const resultUser = await service.registryUser({
          account: localAccountInfo.account,
          email: localAccountInfo.email,
          password: localAccountInfo.password,
          code: localAccountInfo.code,
        });
        expect(resultUser).toBeInstanceOf(ApiResponse);
        expect(resultUser.message).toBe('Successfully registered');
        expect(resultUser.code).toBe(HttpStatus.OK);
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        expect(err).toBe('Registration failed');
      }
      const { clear } = useMockRegisterUser({
        registryCodeService,
        sequelize,
        registryService: service,
        uxJwtService,
        accountInfo: localAccountInfo,
      });
      await clear();
    });

    it('should throw error if email already exists', async () => {
      try {
        await service.registryUser(accountInfo);
      } catch (err) {
        const error = err as unknown as InstanceType<typeof HttpException>;
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(
          'This email has already been used to register an account',
        );
      }
    });

    it('should throw error if account already exists', async () => {
      try {
        const localAccountInfo = {
          ...accountInfo,
          email: 'jlagjalgj@qq.com',
        };
        await service.registryUser(localAccountInfo);
      } catch (err) {
        const error = err as unknown as InstanceType<typeof HttpException>;
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Username already exists');
      }
    });
  });

  describe('findOne', () => {
    it('should return a registry user by where condition', async () => {
      const r = await service.findOne(
        {
          account: accountInfo.account,
        },
        ['account'],
      );
      expect(r).toBeDefined();
      expect(r!.account).toBe(accountInfo.account);
      expect(r!.id).toBeUndefined();
    });
  });

  describe('fromAccountToUser', () => {
    it('should find user by account', async () => {
      const r = await service.fromAccountToUser(accountInfo.account, [
        'account',
      ]);
      expect(r).toBeDefined();
      expect(r!.account).toBe(accountInfo.account);
      expect(r!.id).toBeUndefined();
    });
  });

  describe('fromEmailToUser', () => {
    it('should find user by email', async () => {
      const r = await service.fromEmailToUser(accountInfo.email, ['email']);
      expect(r).toBeDefined();
      expect(r!.email).toBe(accountInfo.email);
      expect(r!.id).toBeUndefined();
    });
  });

  describe('updatedSecureId', () => {
    it('should update secureid successfully', async () => {
      const result = await service.findOne({
        account: accountInfo.account,
      });
      expect(result).toBeDefined();
      const flag = await service.updatedSecureId(result!.id, generateId());
      expect(flag).toBe(true);
    });
  });

  describe('updatePassword', () => {
    it('should update password and generate new secureid', async () => {
      const result = await service.findOne({
        account: accountInfo.account,
      });
      expect(result).toBeDefined();
      const flag = await service.updatePassword(
        result!.id,
        uxPasswordService.encryptedPassword('123456789'),
      );
      expect(flag).toBe(true);
    });
  });

  describe('closeAccount', () => {
    it('should successfully delete the account', async () => {
      const accountInfo: RegistryUserDto = {
        account: 'testuser6',
        email: 'lajglajgagj@qq.com',
        password: '123456',
        code: '444444',
      };

      const r1 = await registryCodeService.insertEmailCode(
        accountInfo.email,
        accountInfo.code,
      );
      expect(r1).toBe(true);
      const r2 = await service.registryUser({
        ...accountInfo,
      });
      expect(r2).toBeDefined();
      expect(r2).toBeInstanceOf(ApiResponse);
      const result = await service.findOne(
        {
          account: accountInfo.account,
        },
        ['id'],
      );
      expect(result).toBeDefined();
      const id = result!.id;
      expect(typeof id).toBe('string');
      const r = await service.closeAccount(id);
      expect(r).toBe(true);
    });
    it('should fail to delete the account', async () => {
      try {
        const id = 'xxxx';
        await service.closeAccount(id);
      } catch (err) {
        expect(err).toBeDefined();
        const error = err as unknown as InstanceType<typeof HttpException>;
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Account does not exist');
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
