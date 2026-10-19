import { describe, it, expect, beforeEach } from "vitest";
import { IRepositorioVinculoEmpregaticio, TipoCargo, VinculoEmpregaticio } from "@saas/shared";
import { RemoverMembroCasoDeUso } from "../../../../src/application/use-cases/remover-membro.caso-de-uso";
import { RemoverMembroInput } from "../../../../src/application/dtos/remover-membro.input";
import {
    MembroNaoEncontradoError,
    Organizacao,
    OrganizacaoNaoEncontradaError,
    PermissaoInsuficienteError,
    UltimoProprietarioError,
} from "../../../../src/domain";
import { configurarVinculosAtivos, criarOrganizacao, criarRepositorios, criarVinculo } from "./fixtures";

// O cargo do solicitante chega pronto, verificado pelo CargoGuard; o caso de uso não o busca de novo
describe("RemoverMembroCasoDeUso", () => {
    let sut: RemoverMembroCasoDeUso;
    let vinculoRepo: IRepositorioVinculoEmpregaticio;
    let organizacao: Organizacao;

    function vinculoNaOrganizacao(cargo: TipoCargo, ativo = true): VinculoEmpregaticio {
        return criarVinculo({ organizacaoId: organizacao.id.valor, cargo, ativo });
    }

    function input(cargoDoSolicitante: TipoCargo, alvo: VinculoEmpregaticio | string): RemoverMembroInput {
        const alvoUsuarioId = typeof alvo === "string" ? alvo : alvo.usuarioId.valor;
        return new RemoverMembroInput(cargoDoSolicitante, organizacao.id.valor, alvoUsuarioId);
    }

    beforeEach(() => {
        ({ vinculoRepo } = criarRepositorios());
        sut = new RemoverMembroCasoDeUso(vinculoRepo);

        organizacao = criarOrganizacao();
    });

    describe("quando a remoção for permitida", () => {
        it.each([
            [TipoCargo.PROPRIETARIO, TipoCargo.FUNCIONARIO],
            [TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR],
            [TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO],
            [TipoCargo.ADMINISTRADOR, TipoCargo.ADMINISTRADOR],
        ])("um %s deve desativar o vínculo de um %s", async (cargoDoSolicitante, cargoDoAlvo) => {
            const alvo = vinculoNaOrganizacao(cargoDoAlvo);
            configurarVinculosAtivos(vinculoRepo, [alvo]);

            const resultado = await sut.executar(input(cargoDoSolicitante, alvo));

            expect(resultado.isSucesso).toBe(true);
            expect(alvo.estaAtivo).toBe(false);
            expect(alvo.cargo).toBe(cargoDoAlvo);
            expect(vinculoRepo.salvar).toHaveBeenCalledWith(alvo);
        });

        it("deve ler e gravar o alvo somente sob a trava da organização", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.FUNCIONARIO);
            configurarVinculosAtivos(vinculoRepo, [alvo]);

            await sut.executar(input(TipoCargo.ADMINISTRADOR, alvo));

            expect(vinculoRepo.alterarComTravaDaOrganizacao).toHaveBeenCalledWith(organizacao.id, expect.any(Function));
            expect(vinculoRepo.buscarAtivoPorUsuarioEOrganizacao).not.toHaveBeenCalled();
        });

        it("deve permitir remover um PROPRIETARIO quando houver outro PROPRIETARIO ativo", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO);
            configurarVinculosAtivos(vinculoRepo, [alvo, vinculoNaOrganizacao(TipoCargo.PROPRIETARIO)]);

            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, alvo));

            expect(resultado.isSucesso).toBe(true);
            expect(alvo.estaAtivo).toBe(false);
        });
    });

    describe("regras que dependem do alvo", () => {
        it("não deve permitir que um ADMINISTRADOR remova um PROPRIETARIO", async () => {
            const proprietario = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO);
            configurarVinculosAtivos(vinculoRepo, [proprietario, vinculoNaOrganizacao(TipoCargo.PROPRIETARIO)]);

            const resultado = await sut.executar(input(TipoCargo.ADMINISTRADOR, proprietario));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(PermissaoInsuficienteError);
            expect(proprietario.estaAtivo).toBe(true);
            expect(vinculoRepo.salvar).not.toHaveBeenCalled();
        });

        it("não deve permitir remover o único PROPRIETARIO ativo", async () => {
            const proprietario = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO);
            configurarVinculosAtivos(vinculoRepo, [proprietario, vinculoNaOrganizacao(TipoCargo.ADMINISTRADOR)]);

            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, proprietario));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(UltimoProprietarioError);
            expect(proprietario.estaAtivo).toBe(true);
            expect(vinculoRepo.salvar).not.toHaveBeenCalled();
        });

        it("dois PROPRIETARIOS removidos um após o outro (serializados pela trava) não deixam a organização sem dono", async () => {
            const donoA = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO);
            const donoB = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO);
            configurarVinculosAtivos(vinculoRepo, [donoA, donoB]);

            const primeiro = await sut.executar(input(TipoCargo.PROPRIETARIO, donoA));
            const segundo = await sut.executar(input(TipoCargo.PROPRIETARIO, donoB));

            expect(primeiro.isSucesso).toBe(true);
            expect(segundo.falha).toBeInstanceOf(UltimoProprietarioError);
            expect(donoB.estaAtivo).toBe(true);
        });

        it("deve retornar falha quando o alvo já estiver desativado", async () => {
            const alvoInativo = vinculoNaOrganizacao(TipoCargo.FUNCIONARIO, false);
            configurarVinculosAtivos(vinculoRepo, [alvoInativo]);

            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, alvoInativo));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(MembroNaoEncontradoError);
        });

        it("deve tratar um id de membro inválido como membro não encontrado, sem abrir a trava", async () => {
            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, "id-invalido"));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(MembroNaoEncontradoError);
            expect(vinculoRepo.alterarComTravaDaOrganizacao).not.toHaveBeenCalled();
        });

        it("deve tratar um id de organização inválido como organização não encontrada", async () => {
            const resultado = await sut.executar(
                new RemoverMembroInput(TipoCargo.PROPRIETARIO, "id-invalido", vinculoNaOrganizacao(TipoCargo.FUNCIONARIO).usuarioId.valor),
            );

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
            expect(vinculoRepo.alterarComTravaDaOrganizacao).not.toHaveBeenCalled();
        });
    });
});
