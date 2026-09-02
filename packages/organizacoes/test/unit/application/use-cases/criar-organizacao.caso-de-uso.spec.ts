import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CriarOrganizacaoCasoDeUso } from '../../../../src/application/use-cases/criar-organizacao.caso-de-uso';
import { IRepositorioOrganizacao, OrganizacaoJaExistenteError } from '../../../../src/domain';

describe('CriarOrganizacaoCasoDeUso', () => {
    let sut: CriarOrganizacaoCasoDeUso; // System Under Test
    let organizacaoRepository: IRepositorioOrganizacao;

    beforeEach(() => {
        // Criando Mock da Interface (Port)
        organizacaoRepository = {
            buscarPorSlug: vi.fn(),
            salvar: vi.fn(),
        } as unknown as IRepositorioOrganizacao;

        sut = new CriarOrganizacaoCasoDeUso(organizacaoRepository);
    });

    it('deve criar uma nova organização com sucesso, gerando o slug a partir do nome', async () => {
        const input = {
            nome: 'Empresa Teste',
        };

        vi.spyOn(organizacaoRepository, 'buscarPorSlug').mockResolvedValue(null);

        const result = await sut.executar(input);

        expect(result.isSucesso).toBe(true);
        expect(result.resultado.nome.valor).toBe(input.nome);
        expect(result.resultado.slug.valor).toBe('empresa-teste');
        expect(organizacaoRepository.salvar).toHaveBeenCalled();
    });

    it('deve normalizar um slug customizado quando fornecido', async () => {
        const input = {
            nome: 'Empresa Teste',
            slug: 'Slug Customizado!',
        };

        vi.spyOn(organizacaoRepository, 'buscarPorSlug').mockResolvedValue(null);

        const result = await sut.executar(input);

        expect(result.isSucesso).toBe(true);
        expect(result.resultado.slug.valor).toBe('slug-customizado');
    });

    it('não deve permitir criação com slug duplicado', async () => {
        const input = {
            nome: 'Empresa Duplicada',
        };

        // Simulamos que o repositório já encontrou uma organização com esse slug
        vi.spyOn(organizacaoRepository, 'buscarPorSlug').mockResolvedValue({} as any);

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(result.falha).toBeInstanceOf(OrganizacaoJaExistenteError);
        expect(organizacaoRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve retornar falha se o nome for inválido', async () => {
        const input = {
            nome: 'A',
        };

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(organizacaoRepository.buscarPorSlug).not.toHaveBeenCalled();
        expect(organizacaoRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve retornar falha se o slug informado for inválido mesmo após normalização', async () => {
        const input = {
            nome: 'Empresa Teste',
            slug: '!!!',
        };

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(organizacaoRepository.salvar).not.toHaveBeenCalled();
    });
});
