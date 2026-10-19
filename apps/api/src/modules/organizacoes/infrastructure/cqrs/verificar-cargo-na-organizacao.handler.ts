import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Result, VinculoEmpregaticioPublico } from "@saas/shared";
import { VerificarCargoNaOrganizacaoCasoDeUso, VerificarCargoNaOrganizacaoInput } from "@saas/organizacoes";
import { VerificarCargoNaOrganizacaoQuery } from "./verificar-cargo-na-organizacao.query";

@QueryHandler(VerificarCargoNaOrganizacaoQuery)
export class VerificarCargoNaOrganizacaoHandler implements IQueryHandler<VerificarCargoNaOrganizacaoQuery>{
    constructor(
        private readonly verificarCargoNaOrganizacaoCasoDeUso: VerificarCargoNaOrganizacaoCasoDeUso
    ){}

    async execute(query: VerificarCargoNaOrganizacaoQuery): Promise<Result<VinculoEmpregaticioPublico>> {
        return this.verificarCargoNaOrganizacaoCasoDeUso.executar(
            new VerificarCargoNaOrganizacaoInput(query.usuarioId, query.organizacaoId, query.cargosPermitidos)
        )
    }
}
