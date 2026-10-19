import { IRepositorioVinculoEmpregaticio, Result } from "@saas/shared";
import { IRepositorioOrganizacao, Organizacao } from "../../domain";
import { ListarMinhasOrganizacoesInput } from "../dtos/listar-minhas-organizacoes.input";
import { MinhaOrganizacaoOutput } from "../dtos/minha-organizacao.output";
import { converterIdExistente } from "../helpers/converter-id-existente";

export class ListarMinhasOrganizacoesCasoDeUso {
    constructor(
        private readonly organizacaoRepo: IRepositorioOrganizacao,
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
    ) { }

    /** Lista as organizações em que o usuário tem vínculo ativo, com o cargo dele em cada uma. */
    async executar(input: ListarMinhasOrganizacoesInput): Promise<Result<MinhaOrganizacaoOutput[]>> {
        const usuarioId = converterIdExistente(input.usuarioId);
        if (!usuarioId) {
            return Result.passar([]);
        }

        const vinculos = await this.vinculoRepo.listarAtivosPorUsuario(usuarioId);
        if (vinculos.length === 0) {
            return Result.passar([]);
        }

        const organizacoes = await this.organizacaoRepo.listarPorIds(vinculos.map(vinculo => vinculo.organizacaoId));
        const organizacoesPorId = new Map<string, Organizacao>(
            organizacoes.map(organizacao => [organizacao.id.valor, organizacao]),
        );

        const minhasOrganizacoes = vinculos.flatMap(vinculo => {
            const organizacao = organizacoesPorId.get(vinculo.organizacaoId.valor);
            if (!organizacao) {
                return [];
            }

            return [{
                id: organizacao.id.valor,
                nome: organizacao.nome.valor,
                slug: organizacao.slug.valor,
                cargo: vinculo.cargo,
                membroDesde: vinculo.criadoEm,
            }];
        });

        return Result.passar(minhasOrganizacoes);
    }
}
