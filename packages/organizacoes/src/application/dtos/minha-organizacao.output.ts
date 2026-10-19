import { TipoCargo } from "@saas/shared";

export interface MinhaOrganizacaoOutput {
    readonly id: string;
    readonly nome: string;
    readonly slug: string;
    readonly cargo: TipoCargo;
    readonly membroDesde: Date;
}
