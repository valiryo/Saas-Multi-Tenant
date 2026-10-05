import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    Id,
    IRepositorioVinculoEmpregaticio,
    TipoCargo,
    VinculoEmpregaticio,
} from "@saas/shared";
import {
    IRepositorioSessao,
    IRepositorioUsuario,
    IServicoTokenAutenticacao,
    RenovarTokensCasoDeUso,
    RenovarTokensInput,
    Sessao,
    SessaoInvalidaError,
    Usuario,
} from "../../../../src";

describe("RenovarTokensCasoDeUso", () => {
    const REFRESH_TOKEN = "refresh_token_valido";

    let casoDeUso: RenovarTokensCasoDeUso;
    let usuarioRepoMock: IRepositorioUsuario;
    let vinculoRepoMock: IRepositorioVinculoEmpregaticio;
    let sessaoRepoMock: IRepositorioSessao;
    let servicoAutenticacaoMock: IServicoTokenAutenticacao;
    let usuario: Usuario;
    let sessao: Sessao;

    beforeEach(() => {
        usuario = Usuario.criar({
            nome: "Dev Teste",
            email: "dev@mail.com",
            senhaHash: "hash_validado",
        }).resultado;

        sessao = Sessao.criar({
            usuarioId: usuario.id.valor,
            userAgent: "Mozilla/5.0",
            ipAddress: "127.0.0.1",
            expiraEm: new Date(Date.now() + 60 * 60 * 1000),
        }).resultado;

        usuarioRepoMock = {
            buscarPorId: vi.fn().mockResolvedValue(usuario),
            buscarPorEmail: vi.fn(),
            salvar: vi.fn(),
        } as unknown as IRepositorioUsuario;

        vinculoRepoMock = {
            listarAtivosPorUsuario: vi.fn().mockResolvedValue([]),
        } as unknown as IRepositorioVinculoEmpregaticio;

        sessaoRepoMock = {
            salvar: vi.fn(),
            buscarPorId: vi.fn().mockResolvedValue(sessao),
            buscarAtivasPorUsuarioId: vi.fn(),
            revogarTodasDoUsuario: vi.fn(),
        } as unknown as IRepositorioSessao;

        servicoAutenticacaoMock = {
            gerarTokens: vi.fn().mockResolvedValue({
                accessToken: "novo_access",
                refreshToken: "novo_refresh",
            }),
            verificarRefreshToken: vi.fn().mockResolvedValue({
                sid: sessao.sid.valor,
                sub: usuario.id.valor,
            }),
        } as unknown as IServicoTokenAutenticacao;

        casoDeUso = new RenovarTokensCasoDeUso(
            usuarioRepoMock,
            vinculoRepoMock,
            sessaoRepoMock,
            servicoAutenticacaoMock,
        );
    });

    async function expectSessaoInvalida() {
        const resultado = await casoDeUso.executar(new RenovarTokensInput(REFRESH_TOKEN));

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(SessaoInvalidaError);
        expect(servicoAutenticacaoMock.gerarTokens).not.toHaveBeenCalled();
    }

    it("deve gerar novos tokens mantendo o sid da sessão", async () => {
        const resultado = await casoDeUso.executar(new RenovarTokensInput(REFRESH_TOKEN));

        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado).toEqual({
            accessToken: "novo_access",
            refreshToken: "novo_refresh",
        });
        expect(servicoAutenticacaoMock.verificarRefreshToken).toHaveBeenCalledWith(REFRESH_TOKEN);
        expect(servicoAutenticacaoMock.gerarTokens).toHaveBeenCalledWith({
            sid: sessao.sid.valor,
            sub: usuario.id.valor,
            email: "dev@mail.com",
            vinculoProps: [],
        });
    });

    it("deve recarregar os vínculos ativos do usuário", async () => {
        const organizacaoId = Id.criar().resultado.valor;
        const vinculo = VinculoEmpregaticio.criar({
            usuarioId: usuario.id.valor,
            organizacaoId,
            cargo: TipoCargo.ADMINISTRADOR,
        }).resultado;
        vi.mocked(vinculoRepoMock.listarAtivosPorUsuario).mockResolvedValue([vinculo]);

        await casoDeUso.executar(new RenovarTokensInput(REFRESH_TOKEN));

        expect(servicoAutenticacaoMock.gerarTokens).toHaveBeenCalledWith(
            expect.objectContaining({
                vinculoProps: [{ organizacaoId, tipoCargo: TipoCargo.ADMINISTRADOR }],
            }),
        );
    });

    it("não deve criar nem alterar sessões", async () => {
        await casoDeUso.executar(new RenovarTokensInput(REFRESH_TOKEN));

        expect(sessaoRepoMock.salvar).not.toHaveBeenCalled();
    });

    it("deve falhar quando o refresh token for inválido", async () => {
        vi.mocked(servicoAutenticacaoMock.verificarRefreshToken).mockResolvedValue(null);

        await expectSessaoInvalida();
        expect(sessaoRepoMock.buscarPorId).not.toHaveBeenCalled();
    });

    it("deve falhar quando o payload não contiver sid (token emitido antes das sessões)", async () => {
        vi.mocked(servicoAutenticacaoMock.verificarRefreshToken).mockResolvedValue({
            sub: usuario.id.valor,
        } as any);

        await expectSessaoInvalida();
        expect(sessaoRepoMock.buscarPorId).not.toHaveBeenCalled();
    });

    it("deve falhar quando o payload contiver ids mal formatados", async () => {
        vi.mocked(servicoAutenticacaoMock.verificarRefreshToken).mockResolvedValue({
            sid: "sid-invalido",
            sub: usuario.id.valor,
        });

        await expectSessaoInvalida();
    });

    it("deve falhar quando a sessão não existir", async () => {
        vi.mocked(sessaoRepoMock.buscarPorId).mockResolvedValue(null);

        await expectSessaoInvalida();
    });

    it("deve falhar quando a sessão tiver sido revogada", async () => {
        sessao.revogar();

        await expectSessaoInvalida();
    });

    it("deve falhar quando a sessão estiver expirada", async () => {
        const sessaoExpirada = Sessao.criar({
            sid: sessao.sid.valor,
            usuarioId: usuario.id.valor,
            userAgent: "Mozilla/5.0",
            ipAddress: "127.0.0.1",
            criadaEm: new Date("2026-01-01T00:00:00Z"),
            expiraEm: new Date("2026-01-01T01:00:00Z"),
        }).resultado;
        vi.mocked(sessaoRepoMock.buscarPorId).mockResolvedValue(sessaoExpirada);

        await expectSessaoInvalida();
    });

    it("deve falhar quando a sessão pertencer a outro usuário", async () => {
        vi.mocked(servicoAutenticacaoMock.verificarRefreshToken).mockResolvedValue({
            sid: sessao.sid.valor,
            sub: Id.criar().resultado.valor,
        });

        await expectSessaoInvalida();
    });

    it("deve falhar quando o usuário não existir mais", async () => {
        vi.mocked(usuarioRepoMock.buscarPorId).mockResolvedValue(null);

        await expectSessaoInvalida();
    });
});
