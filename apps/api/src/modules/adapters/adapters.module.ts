import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "@shared/infrastructure/persistence/prisma/prisma.module";
import { BcryptServicoCriptografia } from "@shared/infrastructure/services/bcrypt-servico-criptografia";
import { SERVICO_CRIPTOGRAFIA_TOKEN } from "@shared/shared.tokens";
import { PrismaUsuarioAdapter } from "@users/infrastructure/persistence/prisma/prisma-usuario.adapter";
import { REPOSITORIO_USUARIO_TOKEN } from "@users/usuario.tokens";
import { apiConfig } from "src/config/api.config";

@Global()
@Module({
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [apiConfig.KEY],

            useFactory: (
                config: ConfigType<typeof apiConfig>,
            ) => ({
                secret: config.jwtSecret,

                signOptions: {
                    expiresIn: config.jwtAccessExpiresIn,
                },
            }),
        }),
    ],
    providers: [
        { provide: REPOSITORIO_USUARIO_TOKEN, useClass: PrismaUsuarioAdapter },
        { provide: SERVICO_CRIPTOGRAFIA_TOKEN, useClass: BcryptServicoCriptografia }
    ],
    exports: [
        REPOSITORIO_USUARIO_TOKEN,
        SERVICO_CRIPTOGRAFIA_TOKEN,
        JwtModule
    ]
})
export class AdaptersModule { }