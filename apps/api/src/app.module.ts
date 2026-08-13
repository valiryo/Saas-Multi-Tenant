import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { apiConfig } from "./config/api.config";
import { envValidationSchema } from "./config/env.validation";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthModule } from "./modules/auth/auth.module";
import { UsuariosModule } from "@users/usuarios.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: 'apps/api/.env',
            validationSchema: envValidationSchema,
            load: [apiConfig],
        }),
        AuthModule,
        UsuariosModule
    ],
})
export class AppModule {}