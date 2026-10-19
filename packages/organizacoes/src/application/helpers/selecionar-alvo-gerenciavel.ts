import { Id, Result, TipoCargo, VinculoEmpregaticio } from "@saas/shared";
import {
    MembroNaoEncontradoError,
    PermissaoInsuficienteError,
    PoliticaDeCargos,
    PoliticaDeProprietarios,
    UltimoProprietarioError,
} from "../../domain";

/**
 * Escolhe, entre os vínculos ativos lidos sob a trava da organização, o do membro alvo, e confere
 * as regras que dependem do estado atual dos membros. Rodar sob a trava impede que duas alterações
 * simultâneas passem pela checagem e, juntas, deixem a organização sem PROPRIETARIO.
 */
export function selecionarAlvoGerenciavel(
    vinculosAtivos: VinculoEmpregaticio[],
    membroUsuarioId: Id,
    cargoDoSolicitante: TipoCargo,
    deixaraDeSerProprietario: boolean,
): Result<VinculoEmpregaticio> {
    const alvo = vinculosAtivos.find(vinculo => vinculo.usuarioId.equals(membroUsuarioId));
    if (!alvo) {
        return Result.falhar(new MembroNaoEncontradoError());
    }

    // Regra de negócio: ADMINISTRADOR não altera nem remove um PROPRIETARIO
    if (!PoliticaDeCargos.podeGerenciar(cargoDoSolicitante, alvo)) {
        return Result.falhar(new PermissaoInsuficienteError());
    }

    // Regra de negócio: a organização nunca fica sem PROPRIETARIO ativo
    if (deixaraDeSerProprietario && !PoliticaDeProprietarios.podeDeixarDeSerProprietario(alvo, vinculosAtivos)) {
        return Result.falhar(new UltimoProprietarioError());
    }

    return Result.passar(alvo);
}
