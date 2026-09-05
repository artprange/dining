import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import type { EnvironmentVariables } from '../config/env.validation';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    });

    super({ adapter });
  }

  async onModuleInit() {
    // Falha no boot em vez de no primeiro request se o banco estiver fora.
    await this.$connect();
  }

  async onModuleDestroy() {
    // Sem isso o pool do `pg` fica pendurado em cada restart.
    await this.$disconnect();
  }
}
