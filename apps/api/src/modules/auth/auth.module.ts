import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AdaptersModule } from "../adapters/adapters.module";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        CqrsModule,
        AdaptersModule
    ],
    controllers: [AuthController]
})
export class AuthModule {}