import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { IRepositorioVinculoEmpregaticio } from "@saas/shared";
import { IRepositorioUsuario } from "@saas/usuarios";
import {
    AdicionarMembroCasoDeUso,
    AlterarCargoDoMembroCasoDeUso,
    CriarOrganizacaoCasoDeUso,
    IRepositorioOrganizacao,
    ListarMembrosDaOrganizacaoCasoDeUso,
    ListarMinhasOrganizacoesCasoDeUso,
    RemoverMembroCasoDeUso,
    VerificarCargoNaOrganizacaoCasoDeUso,
} from "@saas/organizacoes";
import { REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN } from "@shared/shared.token";
import { REPOSITORIO_USUARIO_TOKEN } from "@users/usuario.tokens";
import { AdaptersModule } from "../adapters/adapters.module";
import { REPOSITORIO_ORGANIZACAO_TOKEN } from "./organizacao.tokens";
import { OrganizacoesController } from "./organizacoes.controller";
import { CriarOrganizacaoHandler } from "./infrastructure/cqrs/criar-organizacao.handler";
import { AdicionarMembroHandler } from "./infrastructure/cqrs/adicionar-membro.handler";
import { AlterarCargoDoMembroHandler } from "./infrastructure/cqrs/alterar-cargo-do-membro.handler";
import { RemoverMembroHandler } from "./infrastructure/cqrs/remover-membro.handler";
import { ListarMembrosDaOrganizacaoHandler } from "./infrastructure/cqrs/listar-membros-da-organizacao.handler";
import { ListarMinhasOrganizacoesHandler } from "./infrastructure/cqrs/listar-minhas-organizacoes.handler";
import { VerificarCargoNaOrganizacaoHandler } from "./infrastructure/cqrs/verificar-cargo-na-organizacao.handler";

@Module({
    imports: [AdaptersModule, CqrsModule],
    providers: [
        {
            provide: CriarOrganizacaoCasoDeUso,
            useFactory: (organizacaoRepo: IRepositorioOrganizacao) => {
                return new CriarOrganizacaoCasoDeUso(organizacaoRepo);
            },
            inject: [REPOSITORIO_ORGANIZACAO_TOKEN]
        },
        CriarOrganizacaoHandler,
        {
            provide: AdicionarMembroCasoDeUso,
            useFactory: (vinculoRepo: IRepositorioVinculoEmpregaticio, usuarioRepo: IRepositorioUsuario) => {
                return new AdicionarMembroCasoDeUso(vinculoRepo, usuarioRepo);
            },
            inject: [REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN, REPOSITORIO_USUARIO_TOKEN]
        },
        AdicionarMembroHandler,
        {
            provide: AlterarCargoDoMembroCasoDeUso,
            useFactory: (vinculoRepo: IRepositorioVinculoEmpregaticio, usuarioRepo: IRepositorioUsuario) => {
                return new AlterarCargoDoMembroCasoDeUso(vinculoRepo, usuarioRepo);
            },
            inject: [REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN, REPOSITORIO_USUARIO_TOKEN]
        },
        AlterarCargoDoMembroHandler,
        {
            provide: RemoverMembroCasoDeUso,
            useFactory: (vinculoRepo: IRepositorioVinculoEmpregaticio) => {
                return new RemoverMembroCasoDeUso(vinculoRepo);
            },
            inject: [REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN]
        },
        RemoverMembroHandler,
        {
            provide: ListarMembrosDaOrganizacaoCasoDeUso,
            useFactory: (vinculoRepo: IRepositorioVinculoEmpregaticio, usuarioRepo: IRepositorioUsuario) => {
                return new ListarMembrosDaOrganizacaoCasoDeUso(vinculoRepo, usuarioRepo);
            },
            inject: [REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN, REPOSITORIO_USUARIO_TOKEN]
        },
        ListarMembrosDaOrganizacaoHandler,
        {
            provide: ListarMinhasOrganizacoesCasoDeUso,
            useFactory: (organizacaoRepo: IRepositorioOrganizacao, vinculoRepo: IRepositorioVinculoEmpregaticio) => {
                return new ListarMinhasOrganizacoesCasoDeUso(organizacaoRepo, vinculoRepo);
            },
            inject: [REPOSITORIO_ORGANIZACAO_TOKEN, REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN]
        },
        ListarMinhasOrganizacoesHandler,
        {
            // Consultado pelo CargoGuard (@RequerCargo / @RequerMembro)
            provide: VerificarCargoNaOrganizacaoCasoDeUso,
            useFactory: (vinculoRepo: IRepositorioVinculoEmpregaticio) => {
                return new VerificarCargoNaOrganizacaoCasoDeUso(vinculoRepo);
            },
            inject: [REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN]
        },
        VerificarCargoNaOrganizacaoHandler,
    ],
    controllers: [OrganizacoesController],
    exports: [] // handlers resolvidos via CommandBus/QueryBus
})
export class OrganizacoesModule {}
