import { describe, it, expect, vi, beforeEach } from "vitest";
import { Id, IRepositorioVinculoEmpregaticio, TipoCargo } from "@saas/shared";
import { ListarMinhasOrganizacoesCasoDeUso } from "../../../../src/application/use-cases/listar-minhas-organizacoes.caso-de-uso";
import { ListarMinhasOrganizacoesInput } from "../../../../src/application/dtos/listar-minhas-organizacoes.input";
import { IRepositorioOrganizacao } from "../../../../src/domain";
import { criarOrganizacao, criarRepositorios, criarVinculo, novoId } from "./fixtures";

describe("ListarMinhasOrganizacoesCasoDeUso", () => {
    let sut: ListarMinhasOrganizacoesCasoDeUso;
    let organizacaoRepo: IRepositorioOrganizacao;
    let vinculoRepo: IRepositorioVinculoEmpregaticio;
    const usuarioId = novoId();

    beforeEach(() => {
        ({ organizacaoRepo, vinculoRepo } = criarRepositorios());
        sut = new ListarMinhasOrganizacoesCasoDeUso(organizacaoRepo, vinculoRepo);
    });

    it("deve listar as organizações com vínculo ativo, com o cargo do usuário em cada uma", async () => {
        const empresaA = criarOrganizacao("Empresa A Ltda");
        const empresaB = criarOrganizacao("Empresa B Ltda");
        const vinculoA = criarVinculo({ usuarioId, organizacaoId: empresaA.id.valor, cargo: TipoCargo.PROPRIETARIO });
        const vinculoB = criarVinculo({ usuarioId, organizacaoId: empresaB.id.valor, cargo: TipoCargo.FUNCIONARIO });
        vi.mocked(vinculoRepo.listarAtivosPorUsuario).mockResolvedValue([vinculoA, vinculoB]);
        vi.mocked(organizacaoRepo.listarPorIds).mockResolvedValue([empresaB, empresaA]);

        const resultado = await sut.executar(new ListarMinhasOrganizacoesInput(usuarioId));

        expect(resultado.isSucesso).toBe(true);
        expect(vinculoRepo.listarAtivosPorUsuario).toHaveBeenCalledWith(Id.criar(usuarioId).resultado);
        expect(organizacaoRepo.listarPorIds).toHaveBeenCalledWith([empresaA.id, empresaB.id]);
        expect(resultado.resultado).toEqual([
            {
                id: empresaA.id.valor,
                nome: "Empresa A Ltda",
                slug: "empresa-a-ltda",
                cargo: TipoCargo.PROPRIETARIO,
                membroDesde: vinculoA.criadoEm,
            },
            {
                id: empresaB.id.valor,
                nome: "Empresa B Ltda",
                slug: "empresa-b-ltda",
                cargo: TipoCargo.FUNCIONARIO,
                membroDesde: vinculoB.criadoEm,
            },
        ]);
    });

    it("deve retornar lista vazia sem consultar organizações quando o usuário não tiver vínculos ativos", async () => {
        const resultado = await sut.executar(new ListarMinhasOrganizacoesInput(usuarioId));

        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado).toEqual([]);
        expect(organizacaoRepo.listarPorIds).not.toHaveBeenCalled();
    });

    it("deve ignorar vínculos cuja organização não foi encontrada", async () => {
        const empresa = criarOrganizacao();
        vi.mocked(vinculoRepo.listarAtivosPorUsuario).mockResolvedValue([
            criarVinculo({ usuarioId, organizacaoId: empresa.id.valor, cargo: TipoCargo.ADMINISTRADOR }),
            criarVinculo({ usuarioId, organizacaoId: novoId(), cargo: TipoCargo.FUNCIONARIO }),
        ]);
        vi.mocked(organizacaoRepo.listarPorIds).mockResolvedValue([empresa]);

        const resultado = await sut.executar(new ListarMinhasOrganizacoesInput(usuarioId));

        expect(resultado.resultado.map(o => o.id)).toEqual([empresa.id.valor]);
    });

    it.each(["", "id-invalido"])("deve retornar lista vazia para um id de usuário inválido (%j)", async (idInvalido) => {
        const resultado = await sut.executar(new ListarMinhasOrganizacoesInput(idInvalido));

        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado).toEqual([]);
        expect(vinculoRepo.listarAtivosPorUsuario).not.toHaveBeenCalled();
    });
});
