import { IRepositorioVinculoEmpregaticio, Result, VinculoEmpregaticioPublico } from "@saas/shared";
import { OrganizacaoNaoEncontradaError, PermissaoInsuficienteError } from "../../domain";
import { VerificarCargoNaOrganizacaoInput } from "../dtos/verificar-cargo-na-organizacao.input";
import { converterIdExistente } from "../helpers/converter-id-existente";

/**
 * Ponto central da autorização por cargo: usado pelo CargoGuard nas rotas de uma organização.
 * Os demais casos de uso confiam nesta verificação e recebem dela o cargo do solicitante.
 */
export class VerificarCargoNaOrganizacaoCasoDeUso {
    constructor(
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
    ) { }

    /** Confirma que o usuário tem vínculo ativo na organização com um dos cargos permitidos. */
    async executar(input: VerificarCargoNaOrganizacaoInput): Promise<Result<VinculoEmpregaticioPublico>> {
        const organizacaoId = converterIdExistente(input.organizacaoId);
        const usuarioId = converterIdExistente(input.usuarioId);
        if (!organizacaoId || !usuarioId) {
            return Result.falhar(new OrganizacaoNaoEncontradaError());
        }

        const vinculo = await this.vinculoRepo.buscarAtivoPorUsuarioEOrganizacao(usuarioId, organizacaoId);

        // Para quem não é membro, a organização "não existe": responder 403 aqui revelaria que ela existe
        if (!vinculo) {
            return Result.falhar(new OrganizacaoNaoEncontradaError());
        }

        // Membro sem o cargo exigido já sabe que a organização existe: aí sim, 403
        if (!vinculo.possuiAlgumCargo(input.cargosPermitidos)) {
            return Result.falhar(new PermissaoInsuficienteError());
        }

        return Result.passar({
            organizacaoId: vinculo.organizacaoId.valor,
            tipoCargo: vinculo.cargo,
        });
    }
}
