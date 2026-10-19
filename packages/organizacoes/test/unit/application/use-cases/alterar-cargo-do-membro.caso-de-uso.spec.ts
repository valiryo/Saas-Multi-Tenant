import { describe, it, expect, vi, beforeEach } from "vitest";
import { IRepositorioVinculoEmpregaticio, TipoCargo, VinculoEmpregaticio } from "@saas/shared";
import { IRepositorioUsuario, Usuario } from "@saas/usuarios";
import { AlterarCargoDoMembroCasoDeUso } from "../../../../src/application/use-cases/alterar-cargo-do-membro.caso-de-uso";
import { AlterarCargoDoMembroInput } from "../../../../src/application/dtos/alterar-cargo-do-membro.input";
import {
    MembroNaoEncontradoError,
    Organizacao,
    OrganizacaoNaoEncontradaError,
    PermissaoInsuficienteError,
    UltimoProprietarioError,
} from "../../../../src/domain";
import { configurarVinculosAtivos, criarOrganizacao, criarRepositorios, criarUsuario, criarVinculo, novoId } from "./fixtures";

// O cargo do solicitante chega pronto, verificado pelo CargoGuard; o caso de uso não o busca de novo
describe("AlterarCargoDoMembroCasoDeUso", () => {
    let sut: AlterarCargoDoMembroCasoDeUso;
    let vinculoRepo: IRepositorioVinculoEmpregaticio;
    let usuarioRepo: IRepositorioUsuario;

    let organizacao: Organizacao;
    let membro: Usuario;

    function vinculoNaOrganizacao(cargo: TipoCargo, usuarioId = novoId()): VinculoEmpregaticio {
        return criarVinculo({ usuarioId, organizacaoId: organizacao.id.valor, cargo });
    }

    function input(cargoDoSolicitante: TipoCargo, novoCargo: TipoCargo, membroUsuarioId = membro.id.valor) {
        return new AlterarCargoDoMembroInput(cargoDoSolicitante, organizacao.id.valor, membroUsuarioId, novoCargo);
    }

    beforeEach(() => {
        ({ vinculoRepo, usuarioRepo } = criarRepositorios());
        sut = new AlterarCargoDoMembroCasoDeUso(vinculoRepo, usuarioRepo);

        organizacao = criarOrganizacao();
        membro = criarUsuario({ email: "membro@empresa.com", nome: "Joao Souza" });

        vi.mocked(usuarioRepo.buscarPorId).mockResolvedValue(membro);
    });

    describe("quando a alteração for permitida", () => {
        it("deve promover um FUNCIONARIO a ADMINISTRADOR e retornar o membro atualizado", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.FUNCIONARIO, membro.id.valor);
            configurarVinculosAtivos(vinculoRepo, [alvo]);

            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR));

            expect(resultado.isSucesso).toBe(true);
            expect(vinculoRepo.salvar).toHaveBeenCalledWith(alvo);
            expect(alvo.cargo).toBe(TipoCargo.ADMINISTRADOR);
            expect(resultado.resultado).toEqual({
                vinculoId: alvo.id.valor,
                usuarioId: membro.id.valor,
                nome: "Joao Souza",
                email: "membro@empresa.com",
                cargo: TipoCargo.ADMINISTRADOR,
                ativo: true,
                membroDesde: alvo.criadoEm,
            });
        });

        it("deve ler e gravar o alvo somente sob a trava da organização", async () => {
            configurarVinculosAtivos(vinculoRepo, [vinculoNaOrganizacao(TipoCargo.FUNCIONARIO, membro.id.valor)]);

            await sut.executar(input(TipoCargo.ADMINISTRADOR, TipoCargo.ADMINISTRADOR));

            expect(vinculoRepo.alterarComTravaDaOrganizacao).toHaveBeenCalledWith(organizacao.id, expect.any(Function));
            expect(vinculoRepo.buscarAtivoPorUsuarioEOrganizacao).not.toHaveBeenCalled();
        });

        it("deve permitir que um PROPRIETARIO promova outro membro a PROPRIETARIO", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.ADMINISTRADOR, membro.id.valor);
            configurarVinculosAtivos(vinculoRepo, [alvo]);

            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, TipoCargo.PROPRIETARIO));

            expect(resultado.isSucesso).toBe(true);
            expect(alvo.cargo).toBe(TipoCargo.PROPRIETARIO);
        });

        it("deve permitir que um ADMINISTRADOR rebaixe outro ADMINISTRADOR", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.ADMINISTRADOR, membro.id.valor);
            configurarVinculosAtivos(vinculoRepo, [alvo]);

            const resultado = await sut.executar(input(TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO));

            expect(resultado.isSucesso).toBe(true);
            expect(alvo.cargo).toBe(TipoCargo.FUNCIONARIO);
        });

        it("deve permitir rebaixar um PROPRIETARIO quando houver outro PROPRIETARIO ativo", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO, membro.id.valor);
            configurarVinculosAtivos(vinculoRepo, [alvo, vinculoNaOrganizacao(TipoCargo.PROPRIETARIO)]);

            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR));

            expect(resultado.isSucesso).toBe(true);
            expect(alvo.cargo).toBe(TipoCargo.ADMINISTRADOR);
        });
    });

    describe("regras que dependem do alvo e do cargo concedido", () => {
        it("não deve permitir que um ADMINISTRADOR altere o cargo de um PROPRIETARIO", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO, membro.id.valor);
            configurarVinculosAtivos(vinculoRepo, [alvo, vinculoNaOrganizacao(TipoCargo.PROPRIETARIO)]);

            const resultado = await sut.executar(input(TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(PermissaoInsuficienteError);
            expect(alvo.cargo).toBe(TipoCargo.PROPRIETARIO);
            expect(vinculoRepo.salvar).not.toHaveBeenCalled();
        });

        it("não deve permitir que um ADMINISTRADOR promova alguém a PROPRIETARIO, sem nem abrir a trava", async () => {
            configurarVinculosAtivos(vinculoRepo, [vinculoNaOrganizacao(TipoCargo.FUNCIONARIO, membro.id.valor)]);

            const resultado = await sut.executar(input(TipoCargo.ADMINISTRADOR, TipoCargo.PROPRIETARIO));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(PermissaoInsuficienteError);
            expect(vinculoRepo.alterarComTravaDaOrganizacao).not.toHaveBeenCalled();
        });

        it("não deve permitir que o único PROPRIETARIO seja rebaixado", async () => {
            const alvo = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO, membro.id.valor);
            configurarVinculosAtivos(vinculoRepo, [alvo, vinculoNaOrganizacao(TipoCargo.ADMINISTRADOR)]);

            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(UltimoProprietarioError);
            expect(alvo.cargo).toBe(TipoCargo.PROPRIETARIO);
            expect(vinculoRepo.salvar).not.toHaveBeenCalled();
        });

        it("dois PROPRIETARIOS rebaixados um após o outro (serializados pela trava) não deixam a organização sem dono", async () => {
            const donoA = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO);
            const donoB = vinculoNaOrganizacao(TipoCargo.PROPRIETARIO);
            configurarVinculosAtivos(vinculoRepo, [donoA, donoB]);

            const primeiro = await sut.executar(input(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR, donoA.usuarioId.valor));
            const segundo = await sut.executar(input(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR, donoB.usuarioId.valor));

            expect(primeiro.isSucesso).toBe(true);
            expect(segundo.falha).toBeInstanceOf(UltimoProprietarioError);
            expect(donoB.cargo).toBe(TipoCargo.PROPRIETARIO);
        });

        it("deve retornar falha quando o alvo não tiver vínculo ativo na organização", async () => {
            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(MembroNaoEncontradoError);
        });

        it.each(["", "id-invalido"])(
            "deve tratar um id de membro inválido (%j) como membro não encontrado, sem abrir a trava",
            async (membroUsuarioId) => {
                const resultado = await sut.executar(
                    input(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR, membroUsuarioId),
                );

                expect(resultado.isFalha).toBe(true);
                expect(resultado.falha).toBeInstanceOf(MembroNaoEncontradoError);
                expect(vinculoRepo.alterarComTravaDaOrganizacao).not.toHaveBeenCalled();
            },
        );

        it("deve tratar um id de organização inválido como organização não encontrada", async () => {
            const resultado = await sut.executar(
                new AlterarCargoDoMembroInput(TipoCargo.PROPRIETARIO, "id-invalido", membro.id.valor, TipoCargo.ADMINISTRADOR),
            );

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
            expect(vinculoRepo.alterarComTravaDaOrganizacao).not.toHaveBeenCalled();
        });
    });
});
