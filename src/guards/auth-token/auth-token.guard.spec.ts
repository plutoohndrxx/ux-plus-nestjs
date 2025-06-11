import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenGuard } from './auth-token.guard';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';
import { UxJwtModule } from '@/modules/ux-jwt/ux-jwt.module';
import { RegistryService } from '@/routes/registry/registry.service';
import { RegistryModule } from '@/routes/registry/registry.module';
import { ConfigService } from '@nestjs/config';
import { EnvConfigModule } from '@/modules/env-config/env-config.module';
import { MysqlDatabaseModule } from '@/databases/mysql-database/mysql-database.module';
import { RegistryCodeModule } from '@/routes/registry-code/registry-code.module';
import { RegistryCodeService } from '@/routes/registry-code/registry-code.service';
import { Sequelize } from 'sequelize-typescript';
import { useMockRegisterUser } from '@/test-tools';
import { RegistryUserDto } from '@/routes/registry/dto/registry.dto';
import { UxPasswordModule } from '@/modules/ux-password/ux-password.module';
describe('AuthTokenGuard (Real Services)', () => {
  let guard: AuthTokenGuard;
  let uxJwtService: UxJwtService;
  let registryService: RegistryService;
  let configService: ConfigService;
  let registryCodeService: RegistryCodeService;
  let sequelize: Sequelize;
  let enroll: ReturnType<typeof useMockRegisterUser>['enroll'];
  let clear: ReturnType<typeof useMockRegisterUser>['clear'];
  let genValidtoken: ReturnType<typeof useMockRegisterUser>['genValidtoken'];
  let module: TestingModule;
  const accountInfo: RegistryUserDto = {
    account: 'testuser3',
    code: '888888',
    password: '123456',
    email: 'xjlagjla6@qq.com',
  };
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MysqlDatabaseModule,
        EnvConfigModule,
        UxJwtModule,
        RegistryModule,
        RegistryCodeModule,
        UxPasswordModule,
      ],
      providers: [AuthTokenGuard],
    }).compile();
    guard = module.get<AuthTokenGuard>(AuthTokenGuard);
    uxJwtService = module.get<UxJwtService>(UxJwtService);
    registryService = module.get<RegistryService>(RegistryService);
    configService = module.get<ConfigService>(ConfigService);
    registryCodeService = module.get<RegistryCodeService>(RegistryCodeService);
    sequelize = module.get<Sequelize>(Sequelize);

    const p = useMockRegisterUser({
      sequelize: sequelize!,
      registryCodeService: registryCodeService!,
      registryService: registryService!,
      uxJwtService: uxJwtService!,
      accountInfo,
    });
    clear = p.clear;
    genValidtoken = p.genValidtoken;
    enroll = p.enroll;
  });

  afterAll(async () => {
    jest.clearAllTimers();
    await clear();
    await sequelize.close();
    await module.close();
  });

  const mockRequest = (): Request => {
    const req = {} as Request;
    req.headers = {};
    return req;
  };

  const createExecutionContext = (request: Request): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(configService).toBeDefined();
    expect(registryService).toBeDefined();
    expect(registryCodeService).toBeDefined();
    expect(uxJwtService).toBeDefined();
  });

  it('initialization data', async () => {
    await enroll();
  });

  it('should return true when token is valid and user exists', async () => {
    const mockToken = `Bearer ${await genValidtoken()}`;
    const request = mockRequest();
    request.headers['authorization'] = mockToken;
    const context = createExecutionContext(request);
    const r = await guard.canActivate(context);
    expect(r).toBe(true);
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const request = mockRequest();
    const context = createExecutionContext(request);
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('1.should throw UnauthorizedException if token format is invalid', async () => {
    const request = mockRequest();
    request.headers['authorization'] = 'InvalidToken';
    const context = createExecutionContext(request);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('2.should throw UnauthorizedException if token format is invalid', async () => {
    const request = mockRequest();
    request.headers['authorization'] = 'Bearer InvalidToken';
    const context = createExecutionContext(request);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
