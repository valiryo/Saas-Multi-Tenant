import { TipoCargo } from "@saas/shared";

export class VerificarCargoNaOrganizacaoInput {
    constructor(
        public readonly usuarioId: string,
        public readonly organizacaoId: string,
        public readonly cargosPermitidos: readonly TipoCargo[],
    ){}
}
