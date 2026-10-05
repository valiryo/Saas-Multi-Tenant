import { Module } from "@nestjs/common";
import { AdaptersModule } from "../adapters/adapters.module";
import {
    REPOSITORIO_SESSAO_TOKEN,
    REPOSITORIO_USUARIO_TOKEN,
    SERVICO_AUTENTICACAO_TOKEN,
    SERVICO_CRIPTOGRAFIA_TOKEN,
} from "./usuario.tokens";
import { REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN } from "@shared/shared.token";
import { IRepositorioVinculoEmpregaticio } from "@saas/shared";
import {
    AutenticarUsuarioCasoDeUso,
    EncerrarOutrasSessoesCasoDeUso,
    EncerrarSessaoCasoDeUso,
    IRepositorioSessao,
    IRepositorioUsuario,
    IServicoCriptografia,
    IServicoTokenAutenticacao,
    ListarSessoesAtivasCasoDeUso,
    RegistrarUsuarioCasoDeUso,
    RenovarTokensCasoDeUso,
    ValidarSessaoCasoDeUso,
} from "@saas/usuarios";
import { AutenticarUsuarioHandler } from "./infrastructure/cqrs/autenticar-usuario.handler";
import { RegistrarUsuarioHandler } from "./infrastructure/cqrs/registrar-usuario.handler";
import { RenovarTokensHandler } from "./infrastructure/cqrs/renovar-tokens.handler";
import { EncerrarSessaoHandler } from "./infrastructure/cqrs/encerrar-sessao.handler";
import { EncerrarOutrasSessoesHandler } from "./infrastructure/cqrs/encerrar-outras-sessoes.handler";
import { ListarSessoesAtivasHandler } from "./infrastructure/cqrs/listar-sessoes-ativas.handler";
import { ValidarSessaoHandler } from "./infrastructure/cqrs/validar-sessao.handler";
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
        RegistrarUsuarioHandler,
        {
            provide: AutenticarUsuarioCasoDeUso,
            useFactory: (
                usuarioRepo: IRepositorioUsuario,
                vinculoRepo: IRepositorioVinculoEmpregaticio,
                sessaoRepo: IRepositorioSessao,
                servicoCriptografia: IServicoCriptografia,
                servicoAutenticacao: IServicoTokenAutenticacao,
            ) => {
                return new AutenticarUsuarioCasoDeUso(usuarioRepo, vinculoRepo, sessaoRepo, servicoCriptografia, servicoAutenticacao);
            },
            inject: [
                REPOSITORIO_USUARIO_TOKEN,
                REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN,
                REPOSITORIO_SESSAO_TOKEN,
                SERVICO_CRIPTOGRAFIA_TOKEN,
                SERVICO_AUTENTICACAO_TOKEN
            ]
        },
        AutenticarUsuarioHandler,
        {
            provide: RenovarTokensCasoDeUso,
            useFactory: (
                usuarioRepo: IRepositorioUsuario,
                vinculoRepo: IRepositorioVinculoEmpregaticio,
                sessaoRepo: IRepositorioSessao,
                servicoAutenticacao: IServicoTokenAutenticacao,
            ) => {
                return new RenovarTokensCasoDeUso(usuarioRepo, vinculoRepo, sessaoRepo, servicoAutenticacao);
            },
            inject: [
                REPOSITORIO_USUARIO_TOKEN,
                REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN,
                REPOSITORIO_SESSAO_TOKEN,
                SERVICO_AUTENTICACAO_TOKEN
            ]
        },
        RenovarTokensHandler,
        {
            provide: ValidarSessaoCasoDeUso,
            useFactory: (sessaoRepo: IRepositorioSessao) => new ValidarSessaoCasoDeUso(sessaoRepo),
            inject: [REPOSITORIO_SESSAO_TOKEN]
        },
        ValidarSessaoHandler,
        {
            provide: EncerrarSessaoCasoDeUso,
            useFactory: (sessaoRepo: IRepositorioSessao) => new EncerrarSessaoCasoDeUso(sessaoRepo),
            inject: [REPOSITORIO_SESSAO_TOKEN]
        },
        EncerrarSessaoHandler,
        {
            provide: EncerrarOutrasSessoesCasoDeUso,
            useFactory: (sessaoRepo: IRepositorioSessao) => new EncerrarOutrasSessoesCasoDeUso(sessaoRepo),
            inject: [REPOSITORIO_SESSAO_TOKEN]
        },
        EncerrarOutrasSessoesHandler,
        {
            provide: ListarSessoesAtivasCasoDeUso,
            useFactory: (sessaoRepo: IRepositorioSessao) => new ListarSessoesAtivasCasoDeUso(sessaoRepo),
            inject: [REPOSITORIO_SESSAO_TOKEN]
        },
        ListarSessoesAtivasHandler,
    ],
    controllers: [UsuariosController],
    exports: [] //tirei os exports pq nao preciso injetar mais handlers/casos de uso em outros modulos, agora eles sao resolvidos via CQRS (barramentos de comando, query e evento)
})
export class UsuariosModule {}
