import { Query } from "@nestjs/cqrs";
import { Result, TipoCargo, VinculoEmpregaticioPublico } from "@saas/shared";

export class VerificarCargoNaOrganizacaoQuery extends Query<Result<VinculoEmpregaticioPublico>>{
    constructor(
        public readonly usuarioId: string,
        public readonly organizacaoId: string,
        public readonly cargosPermitidos: readonly TipoCargo[],
    ){
        super()
    }
}
