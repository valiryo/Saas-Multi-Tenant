import { describe, it, expect, beforeEach } from "vitest";
import { IRepositorioVinculoEmpregaticio, TipoCargo } from "@saas/shared";
import { VerificarCargoNaOrganizacaoCasoDeUso } from "../../../../src/application/use-cases/verificar-cargo-na-organizacao.caso-de-uso";
import { VerificarCargoNaOrganizacaoInput } from "../../../../src/application/dtos/verificar-cargo-na-organizacao.input";
import { Organizacao, OrganizacaoNaoEncontradaError, PermissaoInsuficienteError } from "../../../../src/domain";
import { configurarVinculosAtivos, criarOrganizacao, criarRepositorios, criarVinculo, novoId } from "./fixtures";

describe("VerificarCargoNaOrganizacaoCasoDeUso", () => {
    const GESTORES = [TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR];

    let sut: VerificarCargoNaOrganizacaoCasoDeUso;
    let vinculoRepo: IRepositorioVinculoEmpregaticio;
    let organizacao: Organizacao;
    let usuarioId: string;

    function configurarVinculo(cargo: TipoCargo, ativo = true): void {
        configurarVinculosAtivos(vinculoRepo, [
            criarVinculo({ usuarioId, organizacaoId: organizacao.id.valor, cargo, ativo }),
        ]);
    }

    function input(cargosPermitidos: TipoCargo[] = GESTORES, organizacaoId = organizacao.id.valor) {
        return new VerificarCargoNaOrganizacaoInput(usuarioId, organizacaoId, cargosPermitidos);
    }

    beforeEach(() => {
        ({ vinculoRepo } = criarRepositorios());
        sut = new VerificarCargoNaOrganizacaoCasoDeUso(vinculoRepo);

        organizacao = criarOrganizacao();
        usuarioId = novoId();
    });

    describe("quando o usuário tiver um dos cargos permitidos", () => {
        it.each([TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR])(
            "deve aceitar um %s e devolver o vínculo verificado",
            async (cargo) => {
                configurarVinculo(cargo);

                const resultado = await sut.executar(input());

                expect(resultado.isSucesso).toBe(true);
                expect(resultado.resultado).toEqual({ organizacaoId: organizacao.id.valor, tipoCargo: cargo });
            },
        );

        it("deve resolver com uma única consulta", async () => {
            configurarVinculo(TipoCargo.PROPRIETARIO);

            await sut.executar(input());

            expect(vinculoRepo.buscarAtivoPorUsuarioEOrganizacao).toHaveBeenCalledTimes(1);
        });

        it("deve aceitar qualquer membro ativo quando todos os cargos forem permitidos", async () => {
            configurarVinculo(TipoCargo.FUNCIONARIO);

            const resultado = await sut.executar(input(Object.values(TipoCargo)));

            expect(resultado.isSucesso).toBe(true);
        });
    });

    describe("quando o usuário for membro, mas sem o cargo exigido", () => {
        it("deve recusar com PermissaoInsuficienteError (403), pois ele já sabe que a organização existe", async () => {
            configurarVinculo(TipoCargo.FUNCIONARIO);

            const resultado = await sut.executar(input());

            expect(resultado.falha).toBeInstanceOf(PermissaoInsuficienteError);
        });
    });

    describe("quando o usuário não for membro ativo", () => {
        it("deve responder OrganizacaoNaoEncontradaError (404), sem revelar que a organização existe", async () => {
            const resultado = await sut.executar(input(Object.values(TipoCargo)));

            expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
        });

        it("deve tratar um ex-membro (vínculo desativado) como não membro", async () => {
            configurarVinculo(TipoCargo.PROPRIETARIO, false);

            const resultado = await sut.executar(input());

            expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
        });

        it("deve dar a mesma resposta para uma organização existente e para uma inexistente", async () => {
            const existente = await sut.executar(input());
            const inexistente = await sut.executar(input(GESTORES, novoId()));

            expect(existente.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
            expect(inexistente.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
            expect(existente.falha.message).toBe(inexistente.falha.message);
        });

        it("deve tratar um id de organização inválido como não encontrado, sem consultar", async () => {
            const resultado = await sut.executar(input(GESTORES, "id-invalido"));

            expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
            expect(vinculoRepo.buscarAtivoPorUsuarioEOrganizacao).not.toHaveBeenCalled();
        });

        it("deve tratar um id de usuário inválido como não encontrado, sem consultar", async () => {
            usuarioId = "id-invalido";

            const resultado = await sut.executar(input());

            expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
            expect(vinculoRepo.buscarAtivoPorUsuarioEOrganizacao).not.toHaveBeenCalled();
        });
    });
});
