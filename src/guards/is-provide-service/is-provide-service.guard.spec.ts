import { Test, TestingModule } from '@nestjs/testing';
import { IsProvideServiceGuard } from './is-provide-service.guard';
import { CpuOverloadProtectionService } from '@/modules/cpu-overload-protection/cpu-overload-protection.service';
import { EnvConfigModule } from '@/modules/env-config/env-config.module';
import { ScheduleModule } from '@nestjs/schedule';

describe('IsProvideServiceGuard', () => {
  let guard: IsProvideServiceGuard;
  let cpuService: CpuOverloadProtectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvConfigModule, ScheduleModule.forRoot()],
      providers: [CpuOverloadProtectionService, IsProvideServiceGuard],
    }).compile();

    cpuService = module.get<CpuOverloadProtectionService>(
      CpuOverloadProtectionService,
    );
    guard = module.get<IsProvideServiceGuard>(IsProvideServiceGuard);
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when shouldDropRequest is false', () => {
    jest.spyOn(cpuService, 'shouldDropRequest').mockReturnValue(false);
    const result = guard.canActivate();
    expect(result).toBe(true);
  });

  it('should return false when shouldDropRequest is true', () => {
    jest.spyOn(cpuService, 'shouldDropRequest').mockReturnValue(true);
    const result = guard.canActivate();
    expect(result).toBe(false);
  });
});
