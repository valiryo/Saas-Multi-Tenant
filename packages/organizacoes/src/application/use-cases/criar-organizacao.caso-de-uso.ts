import { Result, TipoCargo, VinculoEmpregaticio } from "@saas/shared";
import { IRepositorioOrganizacao, Organizacao, OrganizacaoJaExistenteError } from "../../domain";
import { CriarOrganizacaoInput } from "../dtos/criar-organizacao.input";
import { OrganizacaoOutput } from "../dtos/organizacao.output";

export class CriarOrganizacaoCasoDeUso {
    constructor(
        private readonly organizacaoRepo: IRepositorioOrganizacao,
    ){}

    async executar(input: CriarOrganizacaoInput): Promise<Result<OrganizacaoOutput>> {
        // 1. Criação da Entidade com Tratamento de Erro
        const organizacaoResult = Organizacao.criar({
            nome: input.nome,
            slug: input.slug,
        });

        if (organizacaoResult.isFalha) {
            return Result.falhar(organizacaoResult.falha);
        }

        const novaOrganizacao = organizacaoResult.resultado;

        // 2. Regra de Negócio: quem cria a organização se torna o seu PROPRIETARIO
        const vinculoResult = VinculoEmpregaticio.criar({
            usuarioId: input.criadorId,
            organizacaoId: novaOrganizacao.id.valor,
            cargo: TipoCargo.PROPRIETARIO,
            ativo: true,
        });

        if (vinculoResult.isFalha) {
            return Result.falhar(vinculoResult.falha);
        }

        // 3. Regra de Negócio: Slug Único
        const organizacaoJaExistente = await this.organizacaoRepo.buscarPorSlug(novaOrganizacao.slug);
        if (organizacaoJaExistente) {
            return Result.falhar(new OrganizacaoJaExistenteError(novaOrganizacao.slug.valor));
        }

        // 4. Persistência atômica da organização e do vínculo do proprietário
        await this.organizacaoRepo.salvarComVinculo(novaOrganizacao, vinculoResult.resultado);

        // 5. Mapeamento para o DTO de saída
        const output: OrganizacaoOutput = {
            id: novaOrganizacao.id.valor,
            nome: novaOrganizacao.nome.valor,
            slug: novaOrganizacao.slug.valor,
            criadoEm: novaOrganizacao.criadoEm,
        };

        return Result.passar(output);
    }
}
