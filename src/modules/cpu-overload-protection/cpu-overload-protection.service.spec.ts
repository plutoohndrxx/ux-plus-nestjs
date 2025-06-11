import { Test, TestingModule } from '@nestjs/testing';
import { CpuOverloadProtectionService } from './cpu-overload-protection.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as pidusage from 'pidusage';
import { ScheduleModule } from '@nestjs/schedule';

// ✅ 正确模拟模块（无默认导出）
jest.mock('pidusage', () => jest.fn());

describe('CpuOverloadProtectionService', () => {
  let service: CpuOverloadProtectionService;
  let loggerErrorSpy: jest.SpyInstance;

  beforeAll(async () => {
    const configServiceMock = {
      get: jest
        .fn()
        .mockReturnValueOnce('0.7') // CPU_BASE_PROBABILITY
        .mockReturnValueOnce('640'), // CPU_MAX_THRESHOLD
    };

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [
        CpuOverloadProtectionService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<CpuOverloadProtectionService>(
      CpuOverloadProtectionService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    // service.destory();
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startCpuMonitor', () => {
    it('should update overloadTimes when CPU usage is above threshold', async () => {
      // 模拟 CPU 使用率高于阈值
      (pidusage as unknown as jest.Mock).mockResolvedValueOnce({ cpu: 800 });

      await service.startCpuMonitor();

      expect(service['overloadTimes']).toBe(1);
      expect(service['currentCpuPercentage']).toBe(800);
    });

    it('should decrement overloadTimes when CPU usage is below threshold', async () => {
      // 设置初始 overloadTimes
      service['overloadTimes'] = 5;

      // 模拟 CPU 使用率低于阈值
      (pidusage as unknown as jest.Mock).mockResolvedValueOnce({ cpu: 300 });

      await service.startCpuMonitor();

      expect(service['overloadTimes']).toBe(4);
      expect(service['currentCpuPercentage']).toBe(300);
    });

    it('should log error if pidusage fails', async () => {
      // 模拟 pidusage 抛出错误
      (pidusage as unknown as jest.Mock).mockRejectedValueOnce(
        new Error('Test error'),
      );

      await service.startCpuMonitor();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to obtain CPU usage rate',
        expect.any(Error),
      );
    });
  });

  describe('shouldDropRequest', () => {
    it('should return false when CPU is below threshold', () => {
      service['currentCpuPercentage'] = 500; // 低于阈值
      const result = service.shouldDropRequest();
      expect(result).toBe(false);
    });

    it('should return a boolean based on calculated probability when CPU is above threshold', () => {
      service['currentCpuPercentage'] = 800; // 超过阈值
      service['overloadTimes'] = 50;

      // 固定 Math.random() 以确保结果可预测
      const originalRandom = Math.random;
      Math.random = () => 0.5; // 设置固定随机数

      const result = service.shouldDropRequest();

      // 验证返回值类型
      expect(typeof result).toBe('boolean');

      // 恢复原始 Math.random
      Math.random = originalRandom;
    });

    it('should return true when random falls within the calculated probability', () => {
      service['currentCpuPercentage'] = 800; // 超过阈值
      service['overloadTimes'] = 50;

      const originalRandom = Math.random;
      Math.random = () => 0.9; // 超过计算概率 → false

      const result = service.shouldDropRequest();
      expect(result).toBe(false);

      Math.random = () => 0.1; // 低于计算概率 → true
      const result2 = service.shouldDropRequest();
      expect(result2).toBe(true);

      Math.random = originalRandom;
    });
  });
});
