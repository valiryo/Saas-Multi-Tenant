import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { AdaptersModule } from "../adapters/adapters.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./infrastructure/guards/auth.guard";

@Module({
    imports: [
        CqrsModule,
        AdaptersModule,
    ],
    providers: [
        // Guard global: registrado aqui para ter acesso ao QueryBus do CqrsModule
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
    controllers: [AuthController]
})
export class AuthModule {}
