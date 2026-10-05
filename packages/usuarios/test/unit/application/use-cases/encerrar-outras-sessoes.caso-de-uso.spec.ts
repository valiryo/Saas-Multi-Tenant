import { describe, it, expect, beforeEach, vi } from "vitest";
import { Id } from "@saas/shared";
import {
    EncerrarOutrasSessoesCasoDeUso,
    IRepositorioSessao,
    SessaoDoUsuarioInput,
    SessaoInvalidaError,
} from "../../../../src";

describe("EncerrarOutrasSessoesCasoDeUso", () => {
    const USUARIO_ID = "550e8400-e29b-41d4-a716-446655440000";
    const SID_ATUAL = "550e8400-e29b-41d4-a716-446655440001";

    let casoDeUso: EncerrarOutrasSessoesCasoDeUso;
    let sessaoRepoMock: IRepositorioSessao;

    beforeEach(() => {
        sessaoRepoMock = {
            salvar: vi.fn(),
            buscarPorId: vi.fn(),
            buscarAtivasPorUsuarioId: vi.fn(),
            revogarTodasDoUsuario: vi.fn(),
        } as unknown as IRepositorioSessao;

        casoDeUso = new EncerrarOutrasSessoesCasoDeUso(sessaoRepoMock);
    });

    it("deve revogar todas as sessões do usuário exceto a atual", async () => {
        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput(USUARIO_ID, SID_ATUAL));

        expect(resultado.isSucesso).toBe(true);
        expect(sessaoRepoMock.revogarTodasDoUsuario).toHaveBeenCalledWith(
            Id.criar(USUARIO_ID).resultado,
            Id.criar(SID_ATUAL).resultado,
        );
    });

    it.each([
        ["sid ausente", USUARIO_ID, ""],
        ["sid mal formatado", USUARIO_ID, "sid-invalido"],
        ["usuarioId mal formatado", "usuario-invalido", SID_ATUAL],
    ])("deve falhar sem revogar nada quando houver %s", async (_, usuarioId, sid) => {
        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput(usuarioId, sid));

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(SessaoInvalidaError);
        expect(sessaoRepoMock.revogarTodasDoUsuario).not.toHaveBeenCalled();
    });
});
