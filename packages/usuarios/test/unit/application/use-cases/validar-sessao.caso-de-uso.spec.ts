import { describe, it, expect, beforeEach, vi } from "vitest";
import { Id } from "@saas/shared";
import {
    IRepositorioSessao,
    Sessao,
    SessaoDoUsuarioInput,
    SessaoInvalidaError,
    ValidarSessaoCasoDeUso,
} from "../../../../src";

describe("ValidarSessaoCasoDeUso", () => {
    const USUARIO_ID = "550e8400-e29b-41d4-a716-446655440000";

    let casoDeUso: ValidarSessaoCasoDeUso;
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

        casoDeUso = new ValidarSessaoCasoDeUso(sessaoRepoMock);
    });

    async function expectSessaoInvalida(input: SessaoDoUsuarioInput) {
        const resultado = await casoDeUso.executar(input);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(SessaoInvalidaError);
    }

    it("deve passar para uma sessão ativa do próprio usuário", async () => {
        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput(USUARIO_ID, sessao.sid.valor));

        expect(resultado.isSucesso).toBe(true);
        expect(sessaoRepoMock.buscarPorId).toHaveBeenCalledWith(sessao.sid);
    });

    it("deve falhar quando o sid estiver ausente ou mal formatado", async () => {
        await expectSessaoInvalida(new SessaoDoUsuarioInput(USUARIO_ID, "sid-invalido"));
        await expectSessaoInvalida(new SessaoDoUsuarioInput(USUARIO_ID, undefined as unknown as string));
        expect(sessaoRepoMock.buscarPorId).not.toHaveBeenCalled();
    });

    it("deve falhar quando a sessão não existir", async () => {
        vi.mocked(sessaoRepoMock.buscarPorId).mockResolvedValue(null);

        await expectSessaoInvalida(new SessaoDoUsuarioInput(USUARIO_ID, sessao.sid.valor));
    });

    it("deve falhar quando a sessão tiver sido revogada", async () => {
        sessao.revogar();

        await expectSessaoInvalida(new SessaoDoUsuarioInput(USUARIO_ID, sessao.sid.valor));
    });

    it("deve falhar quando a sessão pertencer a outro usuário", async () => {
        await expectSessaoInvalida(new SessaoDoUsuarioInput(Id.criar().resultado.valor, sessao.sid.valor));
    });
});
