import { describe, it, expect, beforeEach, vi } from "vitest";
import { Id } from "@saas/shared";
import {
    IRepositorioSessao,
    ListarSessoesAtivasCasoDeUso,
    Sessao,
    SessaoDoUsuarioInput,
    SessaoInvalidaError,
} from "../../../../src";

describe("ListarSessoesAtivasCasoDeUso", () => {
    const USUARIO_ID = "550e8400-e29b-41d4-a716-446655440000";

    let casoDeUso: ListarSessoesAtivasCasoDeUso;
    let sessaoRepoMock: IRepositorioSessao;

    function criarSessao(ipAddress: string, userAgent: string): Sessao {
        return Sessao.criar({
            usuarioId: USUARIO_ID,
            userAgent,
            ipAddress,
            expiraEm: new Date(Date.now() + 60 * 60 * 1000),
        }).resultado;
    }

    beforeEach(() => {
        sessaoRepoMock = {
            salvar: vi.fn(),
            buscarPorId: vi.fn(),
            buscarAtivasPorUsuarioId: vi.fn().mockResolvedValue([]),
            revogarTodasDoUsuario: vi.fn(),
        } as unknown as IRepositorioSessao;

        casoDeUso = new ListarSessoesAtivasCasoDeUso(sessaoRepoMock);
    });

    it("deve listar as sessões ativas marcando a sessão atual", async () => {
        const atual = criarSessao("127.0.0.1", "Chrome");
        const outra = criarSessao("10.0.0.2", "Firefox");
        vi.mocked(sessaoRepoMock.buscarAtivasPorUsuarioId).mockResolvedValue([atual, outra]);

        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput(USUARIO_ID, atual.sid.valor));

        expect(resultado.isSucesso).toBe(true);
        expect(sessaoRepoMock.buscarAtivasPorUsuarioId).toHaveBeenCalledWith(Id.criar(USUARIO_ID).resultado);
        expect(resultado.resultado).toEqual([
            {
                sid: atual.sid.valor,
                userAgent: "Chrome",
                ipAddress: "127.0.0.1",
                criadaEm: atual.criadaEm,
                expiraEm: atual.expiraEm,
                atual: true,
            },
            {
                sid: outra.sid.valor,
                userAgent: "Firefox",
                ipAddress: "10.0.0.2",
                criadaEm: outra.criadaEm,
                expiraEm: outra.expiraEm,
                atual: false,
            },
        ]);
    });

    it("deve retornar lista vazia quando não houver sessões ativas", async () => {
        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput(USUARIO_ID, Id.criar().resultado.valor));

        expect(resultado.resultado).toEqual([]);
    });

    it("deve falhar quando o usuarioId for inválido", async () => {
        const resultado = await casoDeUso.executar(new SessaoDoUsuarioInput("usuario-invalido", Id.criar().resultado.valor));

        expect(resultado.falha).toBeInstanceOf(SessaoInvalidaError);
        expect(sessaoRepoMock.buscarAtivasPorUsuarioId).not.toHaveBeenCalled();
    });
});
