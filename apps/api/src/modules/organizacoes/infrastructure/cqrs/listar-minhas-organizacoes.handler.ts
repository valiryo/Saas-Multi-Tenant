import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { ListarMinhasOrganizacoesCasoDeUso, ListarMinhasOrganizacoesInput, MinhaOrganizacaoOutput } from "@saas/organizacoes";
import { ListarMinhasOrganizacoesQuery } from "./listar-minhas-organizacoes.query";

@QueryHandler(ListarMinhasOrganizacoesQuery)
export class ListarMinhasOrganizacoesHandler implements IQueryHandler<ListarMinhasOrganizacoesQuery>{
    constructor(
        private readonly listarMinhasOrganizacoesCasoDeUso: ListarMinhasOrganizacoesCasoDeUso
    ){}

    async execute(query: ListarMinhasOrganizacoesQuery): Promise<Result<MinhaOrganizacaoOutput[]>> {
        return this.listarMinhasOrganizacoesCasoDeUso.executar(new ListarMinhasOrganizacoesInput(query.usuarioId))
    }
}
