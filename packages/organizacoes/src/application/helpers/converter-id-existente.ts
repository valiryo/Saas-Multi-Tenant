import { Id } from "@saas/shared";

/**
 * Converte o id de um registro que já deve existir. Vazio ou mal formatado vira `null`,
 * pois `Id.criar` sem valor geraria um id novo em vez de falhar.
 */
export function converterIdExistente(valor: string | undefined): Id | null {
    if (!valor) {
        return null;
    }

    const idResult = Id.criar(valor);
    if (idResult.isFalha) {
        return null;
    }

    return idResult.resultado;
}
