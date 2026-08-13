import { Module } from "@nestjs/common";
import { AdaptersModule } from "../adapters/adapters.module";
import { RegistrarUsuarioCasoDeUso } from "./application/use-cases/register-user";
import { REPOSITORIO_USUARIO_TOKEN } from "./usuario.tokens";
import { SERVICO_CRIPTOGRAFIA_TOKEN } from "@shared/shared.tokens";
import { IRepositorioUsuario } from "./domain/repositories/usuario.repositorio";
import { IServicoCriptografia } from "@shared/domain/services/servico-criptografia";
import { AutenticarUsuarioCasoDeUso } from "./application/use-cases/autenticar-usuario.caso-de-uso";
import { AutenticarUsuarioHandler } from "./infrastructure/cqrs/autenticar-usuario.handler";
import { RegistrarUsuarioHandler } from "./infrastructure/cqrs/registrar-usuario.handler";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
    imports: [AdaptersModule, CqrsModule],
    providers: [
        {
            provide: RegistrarUsuarioCasoDeUso, 
            useFactory: (usuarioRepo: IRepositorioUsuario, servicoCriptografia: IServicoCriptografia) => {
                return new RegistrarUsuarioCasoDeUso(usuarioRepo, servicoCriptografia);
            },
            inject: [
                REPOSITORIO_USUARIO_TOKEN,
                SERVICO_CRIPTOGRAFIA_TOKEN
            ]
        },
        AutenticarUsuarioHandler,
        {
            provide: AutenticarUsuarioCasoDeUso,
            useFactory: (usuarioRepo: IRepositorioUsuario, servicoCriptografia: IServicoCriptografia) => {
                return new AutenticarUsuarioCasoDeUso(usuarioRepo, servicoCriptografia);
            },
            inject: [
                REPOSITORIO_USUARIO_TOKEN,
                SERVICO_CRIPTOGRAFIA_TOKEN
            ]
        },
        RegistrarUsuarioHandler,
    ],
    exports: [] //tirei os exports pq nao preciso injetar mais handlers/casos de uso em outros modulos, agora eles sao resolvidos via CQRS (barramentos de comando, query e evento)
})
export class UsuariosModule {}