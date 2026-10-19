import { TipoCargo, VinculoEmpregaticio } from "@saas/shared";

const CARGOS_GESTORES: readonly TipoCargo[] = [
    TipoCargo.PROPRIETARIO,
    TipoCargo.ADMINISTRADOR,
];

/**
 * Regras sobre o que o cargo de um gestor permite fazer com outros membros.
 * Recebe o cargo (e não o vínculo) do gestor porque ele já vem verificado pelo CargoGuard,
 * evitando buscar o vínculo do solicitante de novo.
 */
export class PoliticaDeCargos {
    // Regra de negócio: ADMINISTRADOR não altera nem remove um PROPRIETARIO
    static podeGerenciar(
        cargoDoGestor: TipoCargo,
        alvo: VinculoEmpregaticio,
    ): boolean {
        if (!CARGOS_GESTORES.includes(cargoDoGestor)) {
            return false;
        }

        return cargoDoGestor === TipoCargo.PROPRIETARIO || !alvo.ehProprietarioAtivo();
    }

    // Regra de negócio: apenas um PROPRIETARIO pode conceder o cargo de PROPRIETARIO
    static podeAtribuir(
        cargoDoGestor: TipoCargo,
        cargoConcedido: TipoCargo,
    ): boolean {
        if (!CARGOS_GESTORES.includes(cargoDoGestor)) {
            return false;
        }

        return cargoConcedido !== TipoCargo.PROPRIETARIO || cargoDoGestor === TipoCargo.PROPRIETARIO;
    }
}
