import { TipoCargo } from "../enums/tipo-cargo.enum";

export interface VinculoEmpregaticioPublico {
    readonly organizacaoId: string,
    readonly tipoCargo: TipoCargo
}