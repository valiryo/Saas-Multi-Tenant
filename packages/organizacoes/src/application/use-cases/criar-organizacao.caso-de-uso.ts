import { Organizacao, OrganizacaoProps } from "../../domain";
import { CriarOrganizacaoInput } from "../dtos/criar-organizacao.input";
import { OrganizacaoOutput } from "../dtos/organizacao.output";
import { Result } from "@saas/shared";
import { IRepositorioOrganizacao } from "../../domain";
import { OrganizacaoJaExistenteError } from "../../domain";
import { NomeDaOrganizacao } from "../../domain";
import { Slug } from "../../domain";

export class CriarOrganizacaoCasoDeUso {
    constructor(
        private readonly organizacaoRepo: IRepositorioOrganizacao,
    ){}

    async executar(input: CriarOrganizacaoInput): Promise<Result<OrganizacaoOutput>> {
        const nomeResult = NomeDaOrganizacao.criar(input.nome);
        if (nomeResult.isFalha) {
            return Result.falhar(nomeResult.falha);
        }
        const nome = nomeResult.resultado;

        const slugResult = Slug.criar(input.slug ?? input.nome);
        if (slugResult.isFalha) {
            return Result.falhar(slugResult.falha);
        }
        const slug = slugResult.resultado;

        // 1. Regra de Negócio: Slug Único
        const organizacaoJaExistente = await this.organizacaoRepo.buscarPorSlug(slug);
        if (organizacaoJaExistente) {
            return Result.falhar(new OrganizacaoJaExistenteError(slug.valor));
        }

        // 2. Criação da Entidade com Tratamento de Erro
        const novaOrganizacaoProps: OrganizacaoProps = {
            nome,
            slug,
        };

        const organizacaoResult = Organizacao.criar(novaOrganizacaoProps);

        if (organizacaoResult.isFalha) {
            return Result.falhar(organizacaoResult.falha);
        }

        const novaOrganizacao = organizacaoResult.resultado;

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
