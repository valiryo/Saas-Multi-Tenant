import { IRepositorioVinculoEmpregaticio, Result, TipoCargo } from "@saas/shared";
import { IRepositorioUsuario, UsuarioNaoEncontradoError } from "@saas/usuarios";
import {
    MembroNaoEncontradoError,
    OrganizacaoNaoEncontradaError,
    PermissaoInsuficienteError,
    PoliticaDeCargos,
} from "../../domain";
import { AlterarCargoDoMembroInput } from "../dtos/alterar-cargo-do-membro.input";
import { MembroOutput } from "../dtos/membro.output";
import { converterIdExistente } from "../helpers/converter-id-existente";
import { montarMembroOutput } from "../helpers/montar-membro-output";
import { selecionarAlvoGerenciavel } from "../helpers/selecionar-alvo-gerenciavel";

/**
 * Que o solicitante é PROPRIETARIO ou ADMINISTRADOR é verificado pelo CargoGuard da rota.
 * Aqui ficam só as regras que dependem do alvo e do cargo concedido, que o guard não conhece.
 */
export class AlterarCargoDoMembroCasoDeUso {
    constructor(
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
        private readonly usuarioRepo: IRepositorioUsuario,
    ) { }

    async executar(input: AlterarCargoDoMembroInput): Promise<Result<MembroOutput>> {
        const organizacaoId = converterIdExistente(input.organizacaoId);
        if (!organizacaoId) {
            return Result.falhar(new OrganizacaoNaoEncontradaError());
        }

        const membroUsuarioId = converterIdExistente(input.membroUsuarioId);
        if (!membroUsuarioId) {
            return Result.falhar(new MembroNaoEncontradoError());
        }

        // 1. Regra de Negócio: só PROPRIETARIO concede PROPRIETARIO (não depende do estado dos membros)
        if (!PoliticaDeCargos.podeAtribuir(input.cargoDoSolicitante, input.novoCargo)) {
            return Result.falhar(new PermissaoInsuficienteError());
        }

        // 2. Regras que dependem dos membros, checadas e gravadas sob a trava da organização
        const vinculoResult = await this.vinculoRepo.alterarComTravaDaOrganizacao(organizacaoId, vinculosAtivos => {
            const alvoResult = selecionarAlvoGerenciavel(
                vinculosAtivos,
                membroUsuarioId,
                input.cargoDoSolicitante,
                input.novoCargo !== TipoCargo.PROPRIETARIO,
            );

            if (alvoResult.isFalha) {
                return Result.falhar(alvoResult.falha);
            }

            const alvo = alvoResult.resultado;
            alvo.alterarCargo(input.novoCargo);
            return Result.passar(alvo);
        });

        if (vinculoResult.isFalha) {
            return Result.falhar(vinculoResult.falha);
        }

        const vinculoSalvo = vinculoResult.resultado;

        const usuario = await this.usuarioRepo.buscarPorId(vinculoSalvo.usuarioId);
        if (!usuario) {
            return Result.falhar(new UsuarioNaoEncontradoError());
        }

        return Result.passar(montarMembroOutput(vinculoSalvo, usuario));
    }
}
