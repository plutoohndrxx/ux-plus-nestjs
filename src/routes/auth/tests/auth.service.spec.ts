import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UxJwtModule } from '@/modules/ux-jwt/ux-jwt.module';
import { RegistryModule } from '@/routes/registry/registry.module';
import { UxPasswordService } from '@/modules/ux-password/ux-password.service';
import { UxPasswordModule } from '@/modules/ux-password/ux-password.module';
import { MysqlDatabaseModule } from '@/databases/mysql-database/mysql-database.module';
import { RegistryCodeModule } from '@/routes/registry-code/registry-code.module';
import { RegistryService } from '@/routes/registry/registry.service';
import { RegistryCodeService } from '@/routes/registry-code/registry-code.service';
import { Sequelize } from 'sequelize-typescript';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';
import { useMockRegisterUser } from '@/test-tools';
import { RegistryUserDto } from '@/routes/registry/dto/registry.dto';
import { UxCryptoRsaService } from '@/services/ux-crypto-rsa/ux-crypto-rsa.service';
describe('AuthService (Integration)', () => {
  let authService: AuthService;
  let registryService: RegistryService;
  let registryCodeService: RegistryCodeService;
  let uxJwtService: UxJwtService;
  let sequelize: Sequelize;
  let uxCryptoRsaService: UxCryptoRsaService;
  let enroll: ReturnType<typeof useMockRegisterUser>['enroll'];
  let clear: ReturnType<typeof useMockRegisterUser>['clear'];
  const accountInfo: RegistryUserDto = {
    account: 'testuser2',
    code: '888888',
    password: '123456',
    email: 'xjlagjlag@qq.com',
  };
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MysqlDatabaseModule,
        UxJwtModule,
        RegistryModule,
        RegistryCodeModule,
        UxPasswordModule,
      ],
      providers: [AuthService, UxCryptoRsaService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    registryService = module.get<RegistryService>(RegistryService);
    registryCodeService = module.get<RegistryCodeService>(RegistryCodeService);
    uxJwtService = module.get<UxJwtService>(UxJwtService);
    sequelize = module.get<Sequelize>(Sequelize);
    uxCryptoRsaService = module.get<UxCryptoRsaService>(UxCryptoRsaService);

    const p = useMockRegisterUser({
      sequelize: sequelize!,
      registryCodeService: registryCodeService!,
      registryService: registryService!,
      uxJwtService: uxJwtService!,
      accountInfo,
    });
    clear = p.clear;
    // genValidtoken = p.genValidtoken;
    enroll = p.enroll;
  });
  afterAll(async () => {
    await clear();
    await sequelize.close();
    await module.close();
  });
  it('initialization data', async () => {
    await enroll();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should throw if account does not exist', async () => {
    await expect(
      authService.validateCredentials('nonexistent', 'password'),
    ).rejects.toThrow('Account does not exist');
  });

  it('should log in successfully', async () => {
    const r = await authService.validateCredentials(
      accountInfo.account,
      uxCryptoRsaService.encrypt(accountInfo.password),
    );
    expect(typeof r.id).toBe('string');
    expect(typeof r.password).toBe('string');
    expect(typeof r.account).toBe('string');
    expect(typeof r.secureid).toBe('string');
  });
});
