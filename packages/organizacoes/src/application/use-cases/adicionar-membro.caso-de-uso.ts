import { Email, IRepositorioVinculoEmpregaticio, Result, TipoCargo, VinculoEmpregaticio } from "@saas/shared";
import { IRepositorioUsuario, UsuarioNaoEncontradoError } from "@saas/usuarios";
import { CargoNaoPermitidoError, OrganizacaoNaoEncontradaError, VinculoJaExistenteError } from "../../domain";
import { AdicionarMembroInput } from "../dtos/adicionar-membro.input";
import { MembroOutput } from "../dtos/membro.output";
import { converterIdExistente } from "../helpers/converter-id-existente";
import { montarMembroOutput } from "../helpers/montar-membro-output";

/** Quem pode adicionar membros (PROPRIETARIO e ADMINISTRADOR) é verificado pelo CargoGuard da rota. */
export class AdicionarMembroCasoDeUso {
    constructor(
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
        private readonly usuarioRepo: IRepositorioUsuario,
    ) { }

    async executar(input: AdicionarMembroInput): Promise<Result<MembroOutput>> {
        // 1. Regra de Negócio: ninguém entra como PROPRIETARIO; o cargo é concedido promovendo um membro existente
        if (input.cargo === TipoCargo.PROPRIETARIO) {
            return Result.falhar(new CargoNaoPermitidoError(
                input.cargo,
                "um novo membro não pode entrar como PROPRIETARIO; promova um membro existente",
            ));
        }

        const organizacaoId = converterIdExistente(input.organizacaoId);
        if (!organizacaoId) {
            return Result.falhar(new OrganizacaoNaoEncontradaError());
        }

        // 2. Localiza o usuário que será adicionado
        const emailResult = Email.criar(input.novoMembroEmail);
        if (emailResult.isFalha) {
            return Result.falhar(emailResult.falha);
        }

        const usuario = await this.usuarioRepo.buscarPorEmail(emailResult.resultado);
        if (!usuario) {
            return Result.falhar(new UsuarioNaoEncontradoError());
        }

        // 3. Regra de Negócio: um vínculo ativo por usuário e organização; um vínculo inativo é reativado
        const vinculoExistente = await this.vinculoRepo.buscarPorUsuarioEOrganizacao(usuario.id, organizacaoId);

        if (vinculoExistente?.estaAtivo) {
            return Result.falhar(new VinculoJaExistenteError());
        }

        let vinculo: VinculoEmpregaticio;
        if (vinculoExistente) {
            vinculoExistente.ativar();
            vinculoExistente.alterarCargo(input.cargo);
            vinculo = vinculoExistente;
        } else {
            const vinculoResult = VinculoEmpregaticio.criar({
                usuarioId: usuario.id.valor,
                organizacaoId: organizacaoId.valor,
                cargo: input.cargo,
            });

            if (vinculoResult.isFalha) {
                return Result.falhar(vinculoResult.falha);
            }

            vinculo = vinculoResult.resultado;
        }

        // 4. Persistência
        const vinculoSalvo = await this.vinculoRepo.salvar(vinculo);

        return Result.passar(montarMembroOutput(vinculoSalvo, usuario));
    }
}
