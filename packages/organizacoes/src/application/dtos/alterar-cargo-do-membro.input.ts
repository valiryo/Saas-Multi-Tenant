import { TipoCargo } from "@saas/shared";

/** `cargoDoSolicitante` vem do vínculo já verificado pelo CargoGuard, sem nova consulta. */
export class AlterarCargoDoMembroInput {
    constructor(
        public readonly cargoDoSolicitante: TipoCargo,
        public readonly organizacaoId: string,
        public readonly membroUsuarioId: string,
        public readonly novoCargo: TipoCargo,
    ){}
}
