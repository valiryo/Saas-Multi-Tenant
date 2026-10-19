import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdMalFormatadoError, TipoCargo, VinculoEmpregaticio } from '@saas/shared';
import { CriarOrganizacaoCasoDeUso } from '../../../../src/application/use-cases/criar-organizacao.caso-de-uso';
import { CriarOrganizacaoInput } from '../../../../src/application/dtos/criar-organizacao.input';
import { IRepositorioOrganizacao, Organizacao, OrganizacaoJaExistenteError } from '../../../../src/domain';
import { criarRepositorios, novoId } from './fixtures';

describe('CriarOrganizacaoCasoDeUso', () => {
    let sut: CriarOrganizacaoCasoDeUso; // System Under Test
    let organizacaoRepository: IRepositorioOrganizacao;
    const criadorId = novoId();

    beforeEach(() => {
        // Criando Mock da Interface (Port)
        organizacaoRepository = criarRepositorios().organizacaoRepo;

        sut = new CriarOrganizacaoCasoDeUso(organizacaoRepository);
    });

    function argumentosSalvos(): [Organizacao, VinculoEmpregaticio] {
        return vi.mocked(organizacaoRepository.salvarComVinculo).mock.calls[0] as [Organizacao, VinculoEmpregaticio];
    }

    it('deve criar uma nova organização com sucesso, gerando o slug a partir do nome', async () => {
        const input = new CriarOrganizacaoInput('Empresa Teste', criadorId);

        const result = await sut.executar(input);

        expect(result.isSucesso).toBe(true);
        // Garante que o retorno é o DTO plano, e não a entidade Organizacao
        expect(result.resultado).toEqual({
            id: expect.any(String),
            nome: input.nome,
            slug: 'empresa-teste',
            criadoEm: expect.any(Date),
        });
        expect(result.resultado).not.toBeInstanceOf(Organizacao);
    });

    it('deve salvar a organização junto com o vínculo PROPRIETARIO ativo do criador', async () => {
        const result = await sut.executar(new CriarOrganizacaoInput('Empresa Teste', criadorId));

        expect(organizacaoRepository.salvarComVinculo).toHaveBeenCalledTimes(1);

        const [organizacao, vinculo] = argumentosSalvos();
        expect(organizacao.id.valor).toBe(result.resultado.id);
        expect(vinculo.usuarioId.valor).toBe(criadorId);
        expect(vinculo.organizacaoId.equals(organizacao.id)).toBe(true);
        expect(vinculo.cargo).toBe(TipoCargo.PROPRIETARIO);
        expect(vinculo.estaAtivo).toBe(true);
    });

    it('deve normalizar um slug customizado quando fornecido', async () => {
        const result = await sut.executar(new CriarOrganizacaoInput('Empresa Teste', criadorId, 'Slug Customizado!'));

        expect(result.isSucesso).toBe(true);
        expect(result.resultado.slug).toBe('slug-customizado');
        expect(organizacaoRepository.buscarPorSlug).toHaveBeenCalledWith(
            expect.objectContaining({ valor: 'slug-customizado' }),
        );
    });

    it('não deve permitir criação com slug duplicado', async () => {
        // Simulamos que o repositório já encontrou uma organização com esse slug
        vi.mocked(organizacaoRepository.buscarPorSlug).mockResolvedValue(
            Organizacao.criar({ nome: 'Empresa Duplicada' }).resultado,
        );

        const result = await sut.executar(new CriarOrganizacaoInput('Empresa Duplicada', criadorId));

        expect(result.isFalha).toBe(true);
        expect(result.falha).toBeInstanceOf(OrganizacaoJaExistenteError);
        expect(organizacaoRepository.salvarComVinculo).not.toHaveBeenCalled();
    });

    it('deve retornar falha se o nome for inválido', async () => {
        const result = await sut.executar(new CriarOrganizacaoInput('A', criadorId));

        expect(result.isFalha).toBe(true);
        expect(organizacaoRepository.buscarPorSlug).not.toHaveBeenCalled();
        expect(organizacaoRepository.salvarComVinculo).not.toHaveBeenCalled();
    });

    it('deve retornar falha se o slug informado for inválido mesmo após normalização', async () => {
        const result = await sut.executar(new CriarOrganizacaoInput('Empresa Teste', criadorId, '!!!'));

        expect(result.isFalha).toBe(true);
        expect(organizacaoRepository.salvarComVinculo).not.toHaveBeenCalled();
    });

    it.each(['', 'criador-invalido'])(
        'deve retornar falha sem consultar o banco quando o id do criador for inválido (%j)',
        async (idInvalido) => {
            const result = await sut.executar(new CriarOrganizacaoInput('Empresa Teste', idInvalido));

            expect(result.isFalha).toBe(true);
            expect(result.falha).toBeInstanceOf(IdMalFormatadoError);
            expect(organizacaoRepository.buscarPorSlug).not.toHaveBeenCalled();
            expect(organizacaoRepository.salvarComVinculo).not.toHaveBeenCalled();
        },
    );
});
