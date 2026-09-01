import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AdaptersModule } from "../adapters/adapters.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./infrastructure/guards/auth.guard";

@Module({
    imports: [
        CqrsModule,
        AdaptersModule,
    ],
    providers: [AuthGuard],
    controllers: [AuthController]
})
export class AuthModule {}