import { PrismaService } from "src/modules/database/services/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})

export class PrismaModule {}