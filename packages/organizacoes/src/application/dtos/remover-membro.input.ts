import { TipoCargo } from "@saas/shared";

/** `cargoDoSolicitante` vem do vínculo já verificado pelo CargoGuard, sem nova consulta. */
export class RemoverMembroInput {
    constructor(
        public readonly cargoDoSolicitante: TipoCargo,
        public readonly organizacaoId: string,
        public readonly membroUsuarioId: string,
    ){}
}
