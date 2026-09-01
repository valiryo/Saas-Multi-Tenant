import { Module } from "@nestjs/common";
import { AdaptersModule } from "../adapters/adapters.module";
import { REPOSITORIO_USUARIO_TOKEN, SERVICO_AUTENTICACAO_TOKEN } from "./usuario.tokens";
import { SERVICO_CRIPTOGRAFIA_TOKEN } from "./usuario.tokens";
import {
    AutenticarUsuarioCasoDeUso,
    IRepositorioUsuario,
    IServicoCriptografia,
    IServicoTokenAutenticacao,
    RegistrarUsuarioCasoDeUso,
} from "@saas/usuarios";
import { AutenticarUsuarioHandler } from "./infrastructure/cqrs/autenticar-usuario.handler";
import { RegistrarUsuarioHandler } from "./infrastructure/cqrs/registrar-usuario.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { UsuariosController } from "./usuarios.controller";

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
            useFactory: (usuarioRepo: IRepositorioUsuario, servicoCriptografia: IServicoCriptografia, servicoAutenticacao: IServicoTokenAutenticacao) => {
                return new AutenticarUsuarioCasoDeUso(usuarioRepo, servicoCriptografia, servicoAutenticacao);
            },
            inject: [
                REPOSITORIO_USUARIO_TOKEN,
                SERVICO_CRIPTOGRAFIA_TOKEN,
                SERVICO_AUTENTICACAO_TOKEN
            ]
        },
        RegistrarUsuarioHandler,
    ],
    controllers: [UsuariosController],
    exports: [] //tirei os exports pq nao preciso injetar mais handlers/casos de uso em outros modulos, agora eles sao resolvidos via CQRS (barramentos de comando, query e evento)
})
export class UsuariosModule {}