import { TipoCargo } from "@saas/shared";

/** A permissão do solicitante é verificada antes, pelo CargoGuard da rota. */
export class AdicionarMembroInput {
    constructor(
        public readonly organizacaoId: string,
        public readonly novoMembroEmail: string,
        public readonly cargo: TipoCargo,
    ){}
}
