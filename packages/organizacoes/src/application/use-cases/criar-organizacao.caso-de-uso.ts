import { Organizacao } from "../../domain";
import { CriarOrganizacaoInput } from "../dtos/criar-organizacao.input";
import { OrganizacaoOutput } from "../dtos/organizacao.output";
import { Result } from "@saas/shared";
import { IRepositorioOrganizacao } from "../../domain";
import { OrganizacaoJaExistenteError } from "../../domain";

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

        // 2. Regra de Negócio: Slug Único
        const organizacaoJaExistente = await this.organizacaoRepo.buscarPorSlug(novaOrganizacao.slug);
        if (organizacaoJaExistente) {
            return Result.falhar(new OrganizacaoJaExistenteError(novaOrganizacao.slug.valor));
        }

        // 3. Persistência
        await this.organizacaoRepo.salvar(novaOrganizacao);

        // 4. Mapeamento para o DTO de saída
        const output: OrganizacaoOutput = {
            id: novaOrganizacao.id.valor,
            nome: novaOrganizacao.nome.valor,
            slug: novaOrganizacao.slug.valor,
        };

        return Result.passar(output);
    }
}
