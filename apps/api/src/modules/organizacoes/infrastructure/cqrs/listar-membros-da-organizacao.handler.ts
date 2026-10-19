import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { ListarMembrosDaOrganizacaoCasoDeUso, ListarMembrosDaOrganizacaoInput, MembroOutput } from "@saas/organizacoes";
import { ListarMembrosDaOrganizacaoQuery } from "./listar-membros-da-organizacao.query";

@QueryHandler(ListarMembrosDaOrganizacaoQuery)
export class ListarMembrosDaOrganizacaoHandler implements IQueryHandler<ListarMembrosDaOrganizacaoQuery>{
    constructor(
        private readonly listarMembrosDaOrganizacaoCasoDeUso: ListarMembrosDaOrganizacaoCasoDeUso
    ){}

    async execute(query: ListarMembrosDaOrganizacaoQuery): Promise<Result<MembroOutput[]>> {
        return this.listarMembrosDaOrganizacaoCasoDeUso.executar(new ListarMembrosDaOrganizacaoInput(query.organizacaoId))
    }
}
