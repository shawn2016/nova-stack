import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { Repository } from 'typeorm';
import { SysJobEntity } from '../../database/entities';
import { toApiId } from '../../common/utils/to-api-id';
import { JobHandlerRegistry } from './job-handler.registry';
import { JobLogService } from './job-log.service';

@Injectable()
export class JobSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobSchedulerService.name);
  private readonly cronJobs = new Map<string, CronJob>();
  private readonly runningLocks = new Set<string>();

  constructor(
    @InjectRepository(SysJobEntity)
    private readonly jobRepo: Repository<SysJobEntity>,
    private readonly handlerRegistry: JobHandlerRegistry,
    private readonly jobLogService: JobLogService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SKIP_JOB_SCHEDULER === 'true') {
      return;
    }
    const jobs = await this.jobRepo.find({ where: { status: 1 } });
    for (const job of jobs) {
      this.schedule(job);
    }
  }

  onModuleDestroy(): void {
    for (const job of this.cronJobs.values()) {
      job.stop();
    }
    this.cronJobs.clear();
  }

  schedule(job: SysJobEntity): void {
    this.unschedule(job.id);
    if (job.status !== 1) {
      return;
    }

    const cronJob = CronJob.from({
      cronTime: job.cronExpression,
      onTick: () => {
        void this.execute(job.id, false);
      },
      start: true,
    });

    this.cronJobs.set(job.id, cronJob);
    this.logger.log(`Scheduled job ${job.name} (${job.id})`);
  }

  unschedule(jobId: string): void {
    const existing = this.cronJobs.get(jobId);
    if (existing) {
      existing.stop();
      this.cronJobs.delete(jobId);
    }
  }

  async runOnce(jobId: string) {
    return this.execute(jobId, true);
  }

  private async execute(jobId: string, force: boolean) {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!force && job.concurrent === 0 && this.runningLocks.has(jobId)) {
      this.logger.warn(`Skip concurrent job ${job.name} (${jobId})`);
      return null;
    }

    this.runningLocks.add(jobId);
    const startTime = new Date();

    try {
      const handler = this.handlerRegistry.get(job.invokeTarget);
      if (!handler) {
        throw new Error(`Handler not found: ${job.invokeTarget}`);
      }
      const message = await handler();
      const log = await this.jobLogService.recordSuccess(job, message, startTime);
      return {
        logId: toApiId(log.id),
        status: 1 as const,
        message,
      };
    } catch (error) {
      const log = await this.jobLogService.recordFailure(job, error, startTime);
      return {
        logId: toApiId(log.id),
        status: 0 as const,
        message: log.message,
      };
    } finally {
      this.runningLocks.delete(jobId);
    }
  }
}
