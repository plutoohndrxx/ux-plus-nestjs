import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import * as pidusage from 'pidusage';
import { toNumber } from '@/tools';
import { SchedulerRegistry } from '@nestjs/schedule';
/**
 * CPU Protection Algorithm: Dynamic Request Dropping Probability Algorithm
 *
 * @export
 * @class CpuOverloadProtectionService
 * @typedef {CpuOverloadProtectionService}
 */
@Injectable()
export class CpuOverloadProtectionService {
  private baseProbability = 0.7; // Base Dropping Probability (0~1)
  private maxCpuThreshold = 640; // CPU Usage Threshold (Percentage)
  private overloadTimes = 0;
  private currentCpuPercentage = 0;
  private logger = new Logger(CpuOverloadProtectionService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.baseProbability = toNumber(
      this.configService.get('CPU_BASE_PROBABILITY')!,
    );
    this.maxCpuThreshold = toNumber(
      this.configService.get('CPU_MAX_THRESHOLD')!,
    );
  }
  // Start CPU monitoring task
  @Interval('CPUSTATE', 3000)
  async startCpuMonitor() {
    try {
      const stats = await pidusage(process.pid);
      this.currentCpuPercentage = stats.cpu;
      if (this.currentCpuPercentage > this.maxCpuThreshold) {
        this.overloadTimes++;
      } else {
        this.overloadTimes = Math.max(0, this.overloadTimes - 1);
      }
    } catch (err) {
      this.logger.error('Failed to obtain CPU usage rate', err);
    }
  }
  /**
   * true means overload, false means no overload
   *
   * @returns {boolean}
   */
  shouldDropRequest() {
    if (this.currentCpuPercentage <= this.maxCpuThreshold) return false;
    const o = Math.min(this.overloadTimes, 100);
    const c = Math.min(this.currentCpuPercentage / 10, 10);
    const maxValue = 10 * Math.exp(10);
    const probability =
      ((0.1 * o * Math.exp(c)) / maxValue) * this.baseProbability;
    return Math.random() < probability;
  }
  destory() {
    const job = this.schedulerRegistry.getInterval('CPUSTATE');
    clearInterval(job);
  }
}
