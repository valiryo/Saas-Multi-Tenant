import { IRepositorioVinculoEmpregaticio, Result } from "@saas/shared";
import { MembroNaoEncontradoError, OrganizacaoNaoEncontradaError } from "../../domain";
import { RemoverMembroInput } from "../dtos/remover-membro.input";
import { converterIdExistente } from "../helpers/converter-id-existente";
import { selecionarAlvoGerenciavel } from "../helpers/selecionar-alvo-gerenciavel";

/**
 * Que o solicitante é PROPRIETARIO ou ADMINISTRADOR é verificado pelo CargoGuard da rota.
 * Aqui ficam só as regras que dependem do alvo, que o guard não conhece.
 */
export class RemoverMembroCasoDeUso {
    constructor(
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
    ) { }

    /** Desativa o vínculo do membro; o histórico é preservado e ele pode ser readicionado depois. */
    async executar(input: RemoverMembroInput): Promise<Result<void>> {
        const organizacaoId = converterIdExistente(input.organizacaoId);
        if (!organizacaoId) {
            return Result.falhar(new OrganizacaoNaoEncontradaError());
        }

        const membroUsuarioId = converterIdExistente(input.membroUsuarioId);
        if (!membroUsuarioId) {
            return Result.falhar(new MembroNaoEncontradoError());
        }

        // Regras que dependem dos membros, checadas e gravadas sob a trava da organização
        const vinculoResult = await this.vinculoRepo.alterarComTravaDaOrganizacao(organizacaoId, vinculosAtivos => {
            const alvoResult = selecionarAlvoGerenciavel(vinculosAtivos, membroUsuarioId, input.cargoDoSolicitante, true);
            if (alvoResult.isFalha) {
                return Result.falhar(alvoResult.falha);
            }

            const alvo = alvoResult.resultado;
            alvo.desativar();
            return Result.passar(alvo);
        });

        if (vinculoResult.isFalha) {
            return Result.falhar(vinculoResult.falha);
        }

        return Result.passar(undefined);
    }
}
