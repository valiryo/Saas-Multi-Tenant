import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailInvalidoError, IRepositorioVinculoEmpregaticio, TipoCargo } from "@saas/shared";
import { IRepositorioUsuario, Usuario, UsuarioNaoEncontradoError } from "@saas/usuarios";
import { AdicionarMembroCasoDeUso } from "../../../../src/application/use-cases/adicionar-membro.caso-de-uso";
import { AdicionarMembroInput } from "../../../../src/application/dtos/adicionar-membro.input";
import {
    CargoNaoPermitidoError,
    Organizacao,
    OrganizacaoNaoEncontradaError,
    VinculoJaExistenteError,
} from "../../../../src/domain";
import { criarOrganizacao, criarRepositorios, criarUsuario, criarVinculo } from "./fixtures";

// A permissão do solicitante é responsabilidade do CargoGuard da rota; aqui só as regras do novo vínculo
describe("AdicionarMembroCasoDeUso", () => {
    let sut: AdicionarMembroCasoDeUso;
    let vinculoRepo: IRepositorioVinculoEmpregaticio;
    let usuarioRepo: IRepositorioUsuario;

    let organizacao: Organizacao;
    let novoMembro: Usuario;

    function input(cargo: TipoCargo = TipoCargo.FUNCIONARIO, email = novoMembro.email.valor): AdicionarMembroInput {
        return new AdicionarMembroInput(organizacao.id.valor, email, cargo);
    }

    beforeEach(() => {
        ({ vinculoRepo, usuarioRepo } = criarRepositorios());
        sut = new AdicionarMembroCasoDeUso(vinculoRepo, usuarioRepo);

        organizacao = criarOrganizacao();
        novoMembro = criarUsuario({ email: "novo.membro@empresa.com", nome: "Joao Souza" });

        vi.mocked(usuarioRepo.buscarPorEmail).mockResolvedValue(novoMembro);
    });

    describe("quando os dados forem válidos", () => {
        it.each([TipoCargo.FUNCIONARIO, TipoCargo.ADMINISTRADOR])(
            "deve adicionar o membro como %s e devolver o membro criado",
            async (cargo) => {
                const resultado = await sut.executar(input(cargo));

                expect(resultado.isSucesso).toBe(true);
                expect(resultado.resultado).toEqual({
                    vinculoId: expect.any(String),
                    usuarioId: novoMembro.id.valor,
                    nome: "Joao Souza",
                    email: "novo.membro@empresa.com",
                    cargo,
                    ativo: true,
                    membroDesde: expect.any(Date),
                });
            },
        );

        it("deve salvar um novo vínculo ativo ligando o usuário à organização", async () => {
            await sut.executar(input(TipoCargo.ADMINISTRADOR));

            expect(vinculoRepo.salvar).toHaveBeenCalledTimes(1);
            const vinculoSalvo = vi.mocked(vinculoRepo.salvar).mock.calls[0]![0];
            expect(vinculoSalvo.usuarioId.equals(novoMembro.id)).toBe(true);
            expect(vinculoSalvo.organizacaoId.equals(organizacao.id)).toBe(true);
            expect(vinculoSalvo.cargo).toBe(TipoCargo.ADMINISTRADOR);
            expect(vinculoSalvo.estaAtivo).toBe(true);
        });

        it("deve buscar o usuário pelo e-mail e o vínculo existente na organização", async () => {
            await sut.executar(input());

            expect(usuarioRepo.buscarPorEmail).toHaveBeenCalledWith(
                expect.objectContaining({ valor: "novo.membro@empresa.com" }),
            );
            expect(vinculoRepo.buscarPorUsuarioEOrganizacao).toHaveBeenCalledWith(novoMembro.id, organizacao.id);
        });

        it("deve reativar com o novo cargo um vínculo inativo já existente, em vez de criar outro", async () => {
            const vinculoInativo = criarVinculo({
                usuarioId: novoMembro.id.valor,
                organizacaoId: organizacao.id.valor,
                cargo: TipoCargo.FUNCIONARIO,
                ativo: false,
            });
            vi.mocked(vinculoRepo.buscarPorUsuarioEOrganizacao).mockResolvedValue(vinculoInativo);

            const resultado = await sut.executar(input(TipoCargo.ADMINISTRADOR));

            expect(resultado.isSucesso).toBe(true);
            expect(vinculoRepo.salvar).toHaveBeenCalledWith(vinculoInativo);
            expect(vinculoInativo.estaAtivo).toBe(true);
            expect(vinculoInativo.cargo).toBe(TipoCargo.ADMINISTRADOR);
            expect(resultado.resultado.vinculoId).toBe(vinculoInativo.id.valor);
        });
    });

    describe("regras de negócio", () => {
        it("não deve permitir adicionar um membro como PROPRIETARIO", async () => {
            const resultado = await sut.executar(input(TipoCargo.PROPRIETARIO));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(CargoNaoPermitidoError);
            expect(usuarioRepo.buscarPorEmail).not.toHaveBeenCalled();
            expect(vinculoRepo.salvar).not.toHaveBeenCalled();
        });

        it("não deve permitir adicionar um usuário que já tem vínculo ativo na organização", async () => {
            vi.mocked(vinculoRepo.buscarPorUsuarioEOrganizacao).mockResolvedValue(
                criarVinculo({
                    usuarioId: novoMembro.id.valor,
                    organizacaoId: organizacao.id.valor,
                    cargo: TipoCargo.FUNCIONARIO,
                }),
            );

            const resultado = await sut.executar(input());

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(VinculoJaExistenteError);
            expect(vinculoRepo.salvar).not.toHaveBeenCalled();
        });

        it("deve retornar falha quando o usuário do e-mail não existir", async () => {
            vi.mocked(usuarioRepo.buscarPorEmail).mockResolvedValue(null);

            const resultado = await sut.executar(input());

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(UsuarioNaoEncontradoError);
            expect(vinculoRepo.salvar).not.toHaveBeenCalled();
        });

        it("deve retornar falha quando o e-mail for inválido", async () => {
            const resultado = await sut.executar(input(TipoCargo.FUNCIONARIO, "email-invalido"));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(EmailInvalidoError);
            expect(usuarioRepo.buscarPorEmail).not.toHaveBeenCalled();
        });

        it.each(["", "id-invalido"])(
            "deve tratar um id de organização inválido (%j) como organização não encontrada",
            async (organizacaoId) => {
                const resultado = await sut.executar(
                    new AdicionarMembroInput(organizacaoId, novoMembro.email.valor, TipoCargo.FUNCIONARIO),
                );

                expect(resultado.isFalha).toBe(true);
                expect(resultado.falha).toBeInstanceOf(OrganizacaoNaoEncontradaError);
                expect(usuarioRepo.buscarPorEmail).not.toHaveBeenCalled();
            },
        );
    });
});
