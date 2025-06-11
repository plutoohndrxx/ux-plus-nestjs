import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { EmailService } from '@/services/email/email.service';
import { UxCryptoRsaService } from '@/services/ux-crypto-rsa/ux-crypto-rsa.service';
import { RegistryUserDto } from '@/routes/registry/dto/registry.dto';
import { RegistryService } from '@/routes/registry/registry.service';
import { RedisService } from '@/modules/redis/redis.service';
import { RegistryCodeService } from '@/routes/registry-code/registry-code.service';
import * as mongoose from 'mongoose';
import { UxPasswordService } from '@/modules/ux-password/ux-password.service';
// RedisService
jest.mock('@/tools', () => {
  const originalModule = jest.requireActual('@/tools');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...originalModule,
    generateCode: jest.fn(() => '123456'),
  };
});
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let uxCryptoRsaService: UxCryptoRsaService;
  let emailService: EmailService;
  let registryService: RegistryService;
  let redisService: RedisService;
  let moduleFixture: TestingModule;
  let uxPasswordService: UxPasswordService;
  let registryCodeService: RegistryCodeService;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UxCryptoRsaService, UxPasswordService],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendRegistryCode: jest.fn().mockResolvedValue(true),
      })
      .compile();
    app = moduleFixture.createNestApplication();
    emailService = moduleFixture.get<EmailService>(EmailService);
    redisService = moduleFixture.get<RedisService>(RedisService);
    uxCryptoRsaService =
      moduleFixture.get<UxCryptoRsaService>(UxCryptoRsaService);
    registryService = moduleFixture.get<RegistryService>(RegistryService);
    uxPasswordService = moduleFixture.get<UxPasswordService>(UxPasswordService);
    registryCodeService =
      moduleFixture.get<RegistryCodeService>(RegistryCodeService);
    await app.init();
  });

  it('should be defined', () => {
    expect(uxCryptoRsaService).toBeDefined();
    expect(emailService).toBeDefined();
    expect(redisService).toBeDefined();
    expect(registryService).toBeDefined();
    expect(uxPasswordService).toBeDefined();
    expect(registryCodeService).toBeDefined();
    expect(app).toBeDefined();
  });

  describe('Login System Testing', () => {
    const testAccountInfo: RegistryUserDto = {
      account: 'testuser1000055',
      password: '123456',
      email: 'xxxxalgjalgj0000@qq.com',
      code: '123456',
    };
    describe('successful registration followed by successful login', () => {
      it('POST /registry/code', () => {
        return request(app.getHttpServer())
          .post('/registry/code')
          .send({
            email: testAccountInfo.email,
          })
          .expect(201)
          .expect({
            code: 200,
            message:
              'The verification code has been sent to your email address. Please check your inbox',
          });
      });

      it('POST /registry/user', () => {
        return request(app.getHttpServer())
          .post('/registry/user')
          .send({
            ...testAccountInfo,
            password: uxCryptoRsaService.encrypt(testAccountInfo.password),
          })
          .expect(201)
          .expect({
            code: 200,
            message: 'Successfully registered',
          });
      });

      it('POST /auth/login', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            account: testAccountInfo.account,
            password: uxCryptoRsaService.encrypt(testAccountInfo.password),
          });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.code).toBe(200);
      });
    });

    describe('Testing Error Boundaries', () => {
      it('POST /registry/code:(This email is already registered)', () => {
        return request(app.getHttpServer())
          .post('/registry/code')
          .send({
            email: testAccountInfo.email,
          })
          .expect(201)
          .expect({
            code: 400,
            message: 'This email is already registered',
          });
      });

      it('POST /registry/user:(failed)', () => {
        return request(app.getHttpServer())
          .post('/registry/user')
          .send({
            ...testAccountInfo,
            password: '123456',
          })
          .expect(400)
          .expect({
            code: 400,
            message: 'failed',
          });
      });
      it('POST /registry/user:(This email has already been used to register an account)', () => {
        return request(app.getHttpServer())
          .post('/registry/user')
          .send({
            ...testAccountInfo,
            password: uxCryptoRsaService.encrypt(testAccountInfo.password),
          })
          .expect(400)
          .expect({
            code: 400,
            message: 'This email has already been used to register an account',
          });
      });
      it('POST /registry/user:(Username already exists)', async () => {
        const email = 'exists@qq.com';
        const r = await request(app.getHttpServer())
          .post('/registry/code')
          .send({
            email,
          });
        expect(r.status).toBe(201);
        expect(r.body.code).toBe(200);
        expect(r.body.message).toBe(
          'The verification code has been sent to your email address. Please check your inbox',
        );

        const r2 = await request(app.getHttpServer())
          .post('/registry/user')
          .send({
            ...testAccountInfo,
            password: uxCryptoRsaService.encrypt(testAccountInfo.password),
            email,
          });
        expect(r2.status).toBe(400);
        expect(r2.body).toEqual({
          code: 400,
          message: 'Username already exists',
        });
        const r3 = await registryCodeService.removeEmailCode(email);
        expect(r3).toBe(true);
      });
      it('POST /auth/login:(Account does not exist)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            account: 'testnotfound',
            password: uxCryptoRsaService.encrypt(testAccountInfo.password),
          });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Account does not exist');
        expect(response.body.code).toBe(400);
      });
      it('POST /auth/login:(Incorrect password)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            account: testAccountInfo.account,
            password: uxCryptoRsaService.encrypt('444444'),
          });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Incorrect password');
        expect(response.body.code).toBe(400);
      });
    });

    afterAll(async () => {
      const r = await registryService.fromAccountToUser(
        testAccountInfo.account,
        ['id'],
      );
      expect(r).toBeDefined();
      await registryService.closeAccount(r!.id);
    });
  });

  afterAll(async () => {
    await redisService.redis.quit();
    await registryService.sequelize.close();
    await mongoose.disconnect();
    await moduleFixture.close();
    await app.close();
  });
});
