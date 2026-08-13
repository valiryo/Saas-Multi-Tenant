import { PrismaService } from "@shared/infrastructure/services/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})

export class PrismaModule {}