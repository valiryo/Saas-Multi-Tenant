import { describe, it, expect, beforeEach, vi } from "vitest";
import { Id } from "@saas/shared";
import {
    EncerrarSessaoCasoDeUso,
    IRepositorioSessao,
    Sessao,
    SessaoDoUsuarioInput,
    SessaoNaoEncontradaError,
} from "../../../../src";

describe("EncerrarSessaoCasoDeUso", () => {
    const USUARIO_ID = "550e8400-e29b-41d4-a716-446655440000";

    let casoDeUso: EncerrarSessaoCasoDeUso;
    let sessaoRepoMock: IRepositorioSessao;
    let sessao: Sessao;

    beforeEach(() => {
        sessao = Sessao.criar({
            usuarioId: USUARIO_ID,
            userAgent: "Mozilla/5.0",
            ipAddress: "127.0.0.1",
            expiraEm: new Date(Date.now() + 60 * 60 * 1000),
        }).resultado;

        sessaoRepoMock = {
            salvar: vi.fn(),
            buscarPorId: vi.fn().mockResolvedValue(sessao),
            buscarAtivasPorUsuarioId: vi.fn(),
            revogarTodasDoUsuario: vi.fn(),
        } as unknown as IRepositorioSessao;

        casoDeUso = new EncerrarSessaoCasoDeUso(sessaoRepoMock);
    });

    async function expectNaoEncontrada(input: SessaoDoUsuarioInput) {
        const resultado = await casoDeUso.executar(input);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(SessaoNaoEncontradaError);
        expect(sessaoRepoMock.salvar).not.toHaveBeenCalled();
    }

    it("deve revogar e salvar a sessão do usuário", async () => {
        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput(USUARIO_ID, sessao.sid.valor));

        expect(resultado.isSucesso).toBe(true);
        expect(sessao.ativo).toBe(false);
        expect(sessaoRepoMock.salvar).toHaveBeenCalledWith(sessao);
    });

    it("deve ser idempotente para uma sessão já revogada", async () => {
        sessao.revogar();

        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput(USUARIO_ID, sessao.sid.valor));

        expect(resultado.isSucesso).toBe(true);
        expect(sessao.ativo).toBe(false);
    });

    it("deve falhar quando a sessão não existir", async () => {
        vi.mocked(sessaoRepoMock.buscarPorId).mockResolvedValue(null);

        await expectNaoEncontrada(new SessaoDoUsuarioInput(USUARIO_ID, sessao.sid.valor));
    });

    it("deve falhar sem revogar quando a sessão pertencer a outro usuário", async () => {
        await expectNaoEncontrada(new SessaoDoUsuarioInput(Id.criar().resultado.valor, sessao.sid.valor));
        expect(sessao.ativo).toBe(true);
    });

    it("deve falhar quando o sid estiver ausente ou mal formatado", async () => {
        await expectNaoEncontrada(new SessaoDoUsuarioInput(USUARIO_ID, "sid-invalido"));
        await expectNaoEncontrada(new SessaoDoUsuarioInput(USUARIO_ID, ""));
        expect(sessaoRepoMock.buscarPorId).not.toHaveBeenCalled();
    });
});
