import { describe, it, expect, vi, beforeEach } from "vitest";
import { IRepositorioVinculoEmpregaticio, TipoCargo } from "@saas/shared";
import { IRepositorioUsuario } from "@saas/usuarios";
import { ListarMembrosDaOrganizacaoCasoDeUso } from "../../../../src/application/use-cases/listar-membros-da-organizacao.caso-de-uso";
import { ListarMembrosDaOrganizacaoInput } from "../../../../src/application/dtos/listar-membros-da-organizacao.input";
import { Organizacao, OrganizacaoNaoEncontradaError } from "../../../../src/domain";
import { criarOrganizacao, criarRepositorios, criarUsuario, criarVinculo } from "./fixtures";

// Que o solicitante é membro da organização é responsabilidade do CargoGuard da rota
describe("ListarMembrosDaOrganizacaoCasoDeUso", () => {
    let sut: ListarMembrosDaOrganizacaoCasoDeUso;
    let vinculoRepo: IRepositorioVinculoEmpregaticio;
    let usuarioRepo: IRepositorioUsuario;
    let organizacao: Organizacao;

    beforeEach(() => {
        ({ vinculoRepo, usuarioRepo } = criarRepositorios());
        sut = new ListarMembrosDaOrganizacaoCasoDeUso(vinculoRepo, usuarioRepo);

        organizacao = criarOrganizacao();
    });

    it("deve listar todos os membros, ativos e inativos, com cargo e status", async () => {
        const proprietario = criarUsuario({ email: "dona@empresa.com", nome: "Ana Lima" });
        const exFuncionario = criarUsuario({ email: "ex@empresa.com", nome: "Carlos Dias" });
        const vinculoProprietario = criarVinculo({
            usuarioId: proprietario.id.valor,
            organizacaoId: organizacao.id.valor,
            cargo: TipoCargo.PROPRIETARIO,
        });
        const vinculoInativo = criarVinculo({
            usuarioId: exFuncionario.id.valor,
            organizacaoId: organizacao.id.valor,
            cargo: TipoCargo.FUNCIONARIO,
            ativo: false,
        });
        vi.mocked(vinculoRepo.listarPorOrganizacao).mockResolvedValue([vinculoProprietario, vinculoInativo]);
        vi.mocked(usuarioRepo.listarPorIds).mockResolvedValue([exFuncionario, proprietario]);

        const resultado = await sut.executar(new ListarMembrosDaOrganizacaoInput(organizacao.id.valor));

        expect(resultado.isSucesso).toBe(true);
        expect(vinculoRepo.listarPorOrganizacao).toHaveBeenCalledWith(organizacao.id);
        expect(usuarioRepo.listarPorIds).toHaveBeenCalledWith([proprietario.id, exFuncionario.id]);
        // Mantém a ordem dos vínculos, independentemente da ordem em que os usuários voltaram
        expect(resultado.resultado).toEqual([
            {
                vinculoId: vinculoProprietario.id.valor,
                usuarioId: proprietario.id.valor,
                nome: "Ana Lima",
                email: "dona@empresa.com",
                cargo: TipoCargo.PROPRIETARIO,
                ativo: true,
                membroDesde: vinculoProprietario.criadoEm,
            },
            {
                vinculoId: vinculoInativo.id.valor,
                usuarioId: exFuncionario.id.valor,
                nome: "Carlos Dias",
                email: "ex@empresa.com",
                cargo: TipoCargo.FUNCIONARIO,
                ativo: false,
                membroDesde: vinculoInativo.criadoEm,
            },
        ]);
    });

    it("deve ignorar vínculos cujo usuário não foi encontrado", async () => {
        const membro = criarUsuario();
        const vinculoDoMembro = criarVinculo({
            usuarioId: membro.id.valor,
            organizacaoId: organizacao.id.valor,
            cargo: TipoCargo.ADMINISTRADOR,
        });
        const vinculoOrfao = criarVinculo({ organizacaoId: organizacao.id.valor, cargo: TipoCargo.FUNCIONARIO });
        vi.mocked(vinculoRepo.listarPorOrganizacao).mockResolvedValue([vinculoDoMembro, vinculoOrfao]);
        vi.mocked(usuarioRepo.listarPorIds).mockResolvedValue([membro]);

        const resultado = await sut.executar(new ListarMembrosDaOrganizacaoInput(organizacao.id.valor));

        expect(resultado.resultado.map(m => m.usuarioId)).toEqual([membro.id.valor]);
    });

    it("deve retornar lista vazia sem consultar usuários quando a organização não tiver vínculos", async () => {
        const resultado = await sut.executar(new ListarMembrosDaOrganizacaoInput(organizacao.id.valor));

        expect(resultado.resultado).toEqual([]);
        expect(usuarioRepo.listarPorIds).not.toHaveBeenCalled();
    });

    it.each(["", "id-invalido"])(
        "deve tratar um id de organização inválido (%j) como organização não encontrada",
        async (organizacaoId) => {
            const resultado = await sut.executar(new ListarMembrosDaOrganizacaoInput(organizacaoId));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
            expect(vinculoRepo.listarPorOrganizacao).not.toHaveBeenCalled();
        },
    );
});
