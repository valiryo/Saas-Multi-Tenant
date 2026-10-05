import { describe, it, expect, beforeEach, vi } from "vitest";
import ms from "ms";
import {
    Id,
    IpInvalidoError,
    IRepositorioVinculoEmpregaticio,
    TipoCargo,
    VinculoEmpregaticio,
} from "@saas/shared";
import {
    AutenticarUsuarioCasoDeUso,
    AutenticarUsuarioInput,
    CredenciaisInvalidasError,
    DURACAO_SESSAO,
    IRepositorioSessao,
    IRepositorioUsuario,
    IServicoCriptografia,
    IServicoTokenAutenticacao,
    Sessao,
    Usuario,
} from "../../../../src";

describe("AutenticarUsuarioCasoDeUso", () => {
    const EMAIL = "dev@mail.com";

    let casoDeUso: AutenticarUsuarioCasoDeUso;
    let usuarioRepoMock: IRepositorioUsuario;
    let vinculoRepoMock: IRepositorioVinculoEmpregaticio;
    let sessaoRepoMock: IRepositorioSessao;
    let criptografiaMock: IServicoCriptografia;
    let servicoAutenticacaoMock: IServicoTokenAutenticacao;
    let usuario: Usuario;

    function criarInput(alteracoes: Partial<AutenticarUsuarioInput> = {}): AutenticarUsuarioInput {
        return {
            email: EMAIL,
            senha: "SenhaForte123!",
            userAgent: "Mozilla/5.0 (Windows NT 10.0)",
            ipAddress: "127.0.0.1",
            ...alteracoes,
        };
    }

    function sessaoSalva(): Sessao {
        return vi.mocked(sessaoRepoMock.salvar).mock.calls[0]![0];
    }

    beforeEach(() => {
        usuario = Usuario.criar({
            nome: "Dev Teste",
            email: EMAIL,
            senhaHash: "hash_validado",
        }).resultado;

        usuarioRepoMock = {
            buscarPorId: vi.fn(),
            buscarPorEmail: vi.fn().mockResolvedValue(usuario),
            salvar: vi.fn(),
        } as unknown as IRepositorioUsuario;

        vinculoRepoMock = {
            listarAtivosPorUsuario: vi.fn().mockResolvedValue([]),
        } as unknown as IRepositorioVinculoEmpregaticio;

        sessaoRepoMock = {
            salvar: vi.fn(),
            buscarPorId: vi.fn(),
            buscarAtivasPorUsuarioId: vi.fn(),
            revogarTodasDoUsuario: vi.fn(),
        } as unknown as IRepositorioSessao;

        criptografiaMock = {
            criptografar: vi.fn(),
            comparar: vi.fn().mockResolvedValue(true),
        } as unknown as IServicoCriptografia;

        servicoAutenticacaoMock = {
            gerarTokens: vi.fn().mockResolvedValue({
                accessToken: "access_token_mock",
                refreshToken: "refresh_token_mock",
            }),
            verificarRefreshToken: vi.fn(),
        } as unknown as IServicoTokenAutenticacao;

        casoDeUso = new AutenticarUsuarioCasoDeUso(
            usuarioRepoMock,
            vinculoRepoMock,
            sessaoRepoMock,
            criptografiaMock,
            servicoAutenticacaoMock
        );
    });

    describe("sucesso", () => {
        it("deve retornar os tokens gerados", async () => {
            const resultado = await casoDeUso.executar(criarInput());

            expect(resultado.isSucesso).toBe(true);
            expect(resultado.resultado).toEqual({
                accessToken: "access_token_mock",
                refreshToken: "refresh_token_mock",
            });
        });

        it("deve comparar a senha informada com o hash do usuário", async () => {
            await casoDeUso.executar(criarInput());

            expect(criptografiaMock.comparar).toHaveBeenCalledWith("SenhaForte123!", "hash_validado");
        });

        it("deve salvar uma nova sessão ativa com os dados do dispositivo", async () => {
            await casoDeUso.executar(criarInput());

            expect(sessaoRepoMock.salvar).toHaveBeenCalledTimes(1);

            const sessao = sessaoSalva();
            expect(sessao.usuarioId.valor).toBe(usuario.id.valor);
            expect(sessao.ipAddress.valor).toBe("127.0.0.1");
            expect(sessao.userAgent).toBe("Mozilla/5.0 (Windows NT 10.0)");
            expect(sessao.ativo).toBe(true);
        });

        it("deve criar a sessão expirando após DURACAO_SESSAO", async () => {
            await casoDeUso.executar(criarInput());

            const sessao = sessaoSalva();
            expect(sessao.expiraEm.getTime() - sessao.criadaEm.getTime()).toBe(ms(DURACAO_SESSAO));
        });

        it("deve gerar tokens com o sid da sessão salva e os vínculos ativos do usuário", async () => {
            const organizacaoId = Id.criar().resultado.valor;
            const vinculo = VinculoEmpregaticio.criar({
                usuarioId: usuario.id.valor,
                organizacaoId,
                cargo: TipoCargo.PROPRIETARIO,
            }).resultado;
            vi.mocked(vinculoRepoMock.listarAtivosPorUsuario).mockResolvedValue([vinculo]);

            await casoDeUso.executar(criarInput());

            expect(vinculoRepoMock.listarAtivosPorUsuario).toHaveBeenCalledWith(usuario.id);
            expect(servicoAutenticacaoMock.gerarTokens).toHaveBeenCalledWith({
                sid: sessaoSalva().sid.valor,
                sub: usuario.id.valor,
                email: EMAIL,
                vinculoProps: [
                    {
                        organizacaoId,
                        tipoCargo: TipoCargo.PROPRIETARIO,
                    },
                ],
            });
        });

        it("deve gerar tokens com vinculoProps vazio quando o usuário não tiver vínculos ativos", async () => {
            await casoDeUso.executar(criarInput());

            expect(servicoAutenticacaoMock.gerarTokens).toHaveBeenCalledWith(
                expect.objectContaining({ vinculoProps: [] }),
            );
        });

        it("não deve exigir que a senha atenda à política de senha forte", async () => {
            const resultado = await casoDeUso.executar(criarInput({ senha: "fraca" }));

            expect(resultado.isSucesso).toBe(true);
        });
    });

    describe("falhas", () => {
        async function expectFalhaSemEfeitos(input: AutenticarUsuarioInput, erro: Function) {
            const resultado = await casoDeUso.executar(input);

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(erro);
            expect(sessaoRepoMock.salvar).not.toHaveBeenCalled();
            expect(servicoAutenticacaoMock.gerarTokens).not.toHaveBeenCalled();
        }

        it("deve retornar CredenciaisInvalidasError se o e-mail for mal formatado", async () => {
            await expectFalhaSemEfeitos(criarInput({ email: "email-invalido" }), CredenciaisInvalidasError);
            expect(usuarioRepoMock.buscarPorEmail).not.toHaveBeenCalled();
        });

        it("deve retornar CredenciaisInvalidasError se a senha estiver vazia", async () => {
            await expectFalhaSemEfeitos(criarInput({ senha: "" }), CredenciaisInvalidasError);
            expect(usuarioRepoMock.buscarPorEmail).not.toHaveBeenCalled();
        });

        it("deve retornar CredenciaisInvalidasError se o e-mail for inexistente", async () => {
            vi.mocked(usuarioRepoMock.buscarPorEmail).mockResolvedValue(null);

            await expectFalhaSemEfeitos(criarInput(), CredenciaisInvalidasError);
        });

        it("deve retornar CredenciaisInvalidasError se a senha estiver incorreta", async () => {
            vi.mocked(criptografiaMock.comparar).mockResolvedValue(false);

            await expectFalhaSemEfeitos(criarInput(), CredenciaisInvalidasError);
        });

        it("deve retornar IpInvalidoError se o IP for mal formatado", async () => {
            await expectFalhaSemEfeitos(criarInput({ ipAddress: "ip-invalido" }), IpInvalidoError);
        });
    });
});
