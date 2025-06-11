import { Injectable, CanActivate } from '@nestjs/common';
import { CpuOverloadProtectionService } from '@/modules/cpu-overload-protection/cpu-overload-protection.service';

@Injectable()
export class IsProvideServiceGuard implements CanActivate {
  constructor(
    private readonly cpuOverloadProtectionService: CpuOverloadProtectionService,
  ) {}
  canActivate() {
    return !this.cpuOverloadProtectionService.shouldDropRequest();
  }
}
