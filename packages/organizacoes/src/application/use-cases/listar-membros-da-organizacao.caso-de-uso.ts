import { IRepositorioVinculoEmpregaticio, Result } from "@saas/shared";
import { IRepositorioUsuario, Usuario } from "@saas/usuarios";
import { OrganizacaoNaoEncontradaError } from "../../domain";
import { ListarMembrosDaOrganizacaoInput } from "../dtos/listar-membros-da-organizacao.input";
import { MembroOutput } from "../dtos/membro.output";
import { converterIdExistente } from "../helpers/converter-id-existente";
import { montarMembroOutput } from "../helpers/montar-membro-output";

/** Que o solicitante é membro da organização é verificado pelo CargoGuard da rota. */
export class ListarMembrosDaOrganizacaoCasoDeUso {
    constructor(
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
        private readonly usuarioRepo: IRepositorioUsuario,
    ) { }

    /** Lista os membros (ativos e inativos) da organização, com cargo e status. */
    async executar(input: ListarMembrosDaOrganizacaoInput): Promise<Result<MembroOutput[]>> {
        const organizacaoId = converterIdExistente(input.organizacaoId);
        if (!organizacaoId) {
            return Result.falhar(new OrganizacaoNaoEncontradaError());
        }

        const vinculos = await this.vinculoRepo.listarPorOrganizacao(organizacaoId);
        if (vinculos.length === 0) {
            return Result.passar([]);
        }

        const usuarios = await this.usuarioRepo.listarPorIds(vinculos.map(vinculo => vinculo.usuarioId));
        const usuariosPorId = new Map<string, Usuario>(usuarios.map(usuario => [usuario.id.valor, usuario]));

        const membros = vinculos.flatMap(vinculo => {
            const usuario = usuariosPorId.get(vinculo.usuarioId.valor);
            return usuario ? [montarMembroOutput(vinculo, usuario)] : [];
        });

        return Result.passar(membros);
    }
}
