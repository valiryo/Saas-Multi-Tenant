import { TipoCargo } from "@saas/shared";

export interface MembroOutput {
    readonly vinculoId: string;
    readonly usuarioId: string;
    readonly nome: string;
    readonly email: string;
    readonly cargo: TipoCargo;
    readonly ativo: boolean;
    readonly membroDesde: Date;
}
