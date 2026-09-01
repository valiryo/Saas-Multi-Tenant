import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import type { ConfigType } from "@nestjs/config";

import { PrismaClient } from "database";
import { apiConfig } from "src/config/api.config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(apiConfig.KEY)
    config: ConfigType<typeof apiConfig>
  ) {
    const connectionString = config.databaseUrl;

    if (!connectionString) {
      throw new Error("DATABASE_URL não foi definida.");
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}