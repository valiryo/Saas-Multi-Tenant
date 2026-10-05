import { describe, expect, it } from "vitest";

import { Id, IpInvalidoError } from "@saas/shared";

import { Sessao } from "../../../../src/domain/entities/sessao.entidade";
import { CriarSessaoProps } from "../../../../src/domain/entities/sessao.entidade";
import { SessaoExpiracaoInvalidaError } from "../../../../src/domain/errors/sessao-expiracao-invalida.error";

describe("Sessao", () => {
    function criarPropsValidas(): CriarSessaoProps {
        return {
            usuarioId: "550e8400-e29b-41d4-a716-446655440000",
            userAgent: "Mozilla/5.0",
            ipAddress: "127.0.0.1",
            expiraEm: new Date(Date.now() + 60 * 60 * 1000),
        };
    }

    function criarSessao(alteracoes: Partial<CriarSessaoProps> = {}): Sessao {
        const resultado = Sessao.criar({
            ...criarPropsValidas(),
            ...alteracoes,
        });

        if (resultado.isFalha) {
            throw resultado.falha;
        }

        return resultado.resultado;
    }

    describe("criar", () => {
        it("deve criar uma sessão válida a partir de dados brutos válidos", () => {
            const props = criarPropsValidas();

            const resultado = Sessao.criar(props);

            expect(resultado.isFalha).toBe(false);

            if (resultado.isFalha) {
                throw resultado.falha;
            }

            const sessao = resultado.resultado;

            expect(sessao.usuarioId.valor).toBe(props.usuarioId);
            expect(sessao.userAgent).toBe(props.userAgent);
            expect(sessao.ipAddress.valor).toBe(props.ipAddress);
            expect(sessao.expiraEm).toBe(props.expiraEm);
        });

        it("deve gerar um sid quando ele não for informado", () => {
            const sessao = criarSessao();

            expect(sessao.sid.valor).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            );
        });

        it("deve utilizar o sid informado quando ele for fornecido", () => {
            const sid = "550e8400-e29b-41d4-a716-446655440001";

            const sessao = criarSessao({ sid });

            expect(sessao.sid.valor).toBe(sid);
        });

        it("deve gerar sids diferentes para sessões distintas quando o sid não for informado", () => {
            const sessaoA = criarSessao();
            const sessaoB = criarSessao();

            expect(sessaoA.sid.valor).not.toBe(sessaoB.sid.valor);
        });

        it("deve retornar falha quando o sid informado estiver mal formatado", () => {
            const resultado = Sessao.criar({
                ...criarPropsValidas(),
                sid: "sid-invalido",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando o usuarioId estiver mal formatado", () => {
            const resultado = Sessao.criar({
                ...criarPropsValidas(),
                usuarioId: "usuario-invalido",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar IpInvalidoError quando o ipAddress for inválido", () => {
            const resultado = Sessao.criar({
                ...criarPropsValidas(),
                ipAddress: "ip-invalido",
            });

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(IpInvalidoError);
        });

        it("deve retornar SessaoExpiracaoInvalidaError quando expiraEm não for posterior a criadaEm", () => {
            const criadaEm = new Date("2026-01-01T00:00:00Z");

            const resultado = Sessao.criar({
                ...criarPropsValidas(),
                criadaEm,
                expiraEm: criadaEm,
            });

            expect(resultado.falha).toBeInstanceOf(SessaoExpiracaoInvalidaError);
        });

        it("deve usar a data atual como criadaEm quando ela não for informada", () => {
            const antes = new Date();

            const sessao = criarSessao();

            const depois = new Date();

            expect(sessao.criadaEm.getTime()).toBeGreaterThanOrEqual(antes.getTime());
            expect(sessao.criadaEm.getTime()).toBeLessThanOrEqual(depois.getTime());
        });

        it("deve utilizar a criadaEm informada quando ela for fornecida", () => {
            const criadaEm = new Date("2026-01-01T00:00:00Z");

            const sessao = criarSessao({
                criadaEm,
                expiraEm: new Date("2026-01-01T01:00:00Z"),
            });

            expect(sessao.criadaEm).toBe(criadaEm);
        });

        it("deve retornar falha quando expiraEm for anterior a criadaEm", () => {
            const resultado = Sessao.criar({
                ...criarPropsValidas(),
                criadaEm: new Date("2026-01-01T01:00:00Z"),
                expiraEm: new Date("2026-01-01T00:00:00Z"),
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando expiraEm for igual a criadaEm", () => {
            const criadaEm = new Date("2026-01-01T00:00:00Z");

            const resultado = Sessao.criar({
                ...criarPropsValidas(),
                criadaEm,
                expiraEm: criadaEm,
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve criar a sessão ativa por padrão", () => {
            const sessao = criarSessao();

            expect(sessao.ativo).toBe(true);
        });

        it("deve permitir criar uma sessão já desativada", () => {
            const sessao = criarSessao({ ativo: false });

            expect(sessao.ativo).toBe(false);
        });
    });

    describe("ativo", () => {
        it("deve ser true para uma sessão recém-criada e não expirada", () => {
            const sessao = criarSessao();

            expect(sessao.ativo).toBe(true);
        });

        it("deve ser false quando a sessão expirou pelo tempo, mesmo sem ter sido revogada", () => {
            const sessao = criarSessao({
                criadaEm: new Date("2026-01-01T00:00:00Z"),
                expiraEm: new Date("2026-01-01T01:00:00Z"),
            });

            expect(sessao.ativo).toBe(false);
        });

        it("deve ser false após a sessão ser revogada", () => {
            const sessao = criarSessao();

            sessao.revogar();

            expect(sessao.ativo).toBe(false);
        });
    });

    describe("estaExpirada", () => {
        it("deve retornar false quando a data de referência for anterior à expiração", () => {
            const sessao = criarSessao({
                criadaEm: new Date("2026-01-01T00:00:00Z"),
                expiraEm: new Date("2026-01-01T01:00:00Z"),
            });

            expect(sessao.estaExpirada(new Date("2026-01-01T00:30:00Z"))).toBe(false);
        });

        it("deve retornar true quando a data de referência for posterior à expiração", () => {
            const sessao = criarSessao({
                criadaEm: new Date("2026-01-01T00:00:00Z"),
                expiraEm: new Date("2026-01-01T01:00:00Z"),
            });

            expect(sessao.estaExpirada(new Date("2026-01-01T02:00:00Z"))).toBe(true);
        });

        it("deve retornar false quando a data de referência for igual à expiração", () => {
            const expiraEm = new Date("2026-01-01T01:00:00Z");

            const sessao = criarSessao({
                criadaEm: new Date("2026-01-01T00:00:00Z"),
                expiraEm,
            });

            expect(sessao.estaExpirada(expiraEm)).toBe(false);
        });

        it("deve usar a data atual como referência quando nenhuma for informada", () => {
            const sessaoExpirada = criarSessao({
                criadaEm: new Date("2026-01-01T00:00:00Z"),
                expiraEm: new Date("2026-01-01T01:00:00Z"),
            });

            expect(sessaoExpirada.estaExpirada()).toBe(true);
        });
    });

    describe("pertenceA", () => {
        it("deve retornar true para o usuário dono da sessão", () => {
            const sessao = criarSessao();

            expect(sessao.pertenceA(Id.criar(criarPropsValidas().usuarioId).resultado)).toBe(true);
        });

        it("deve retornar false para outro usuário", () => {
            const sessao = criarSessao();

            expect(sessao.pertenceA(Id.criar().resultado)).toBe(false);
        });
    });

    describe("estaValidaPara", () => {
        const dono = () => Id.criar(criarPropsValidas().usuarioId).resultado;

        it("deve retornar true para o dono de uma sessão ativa e não expirada", () => {
            const sessao = criarSessao();

            expect(sessao.estaValidaPara(dono())).toBe(true);
        });

        it("deve retornar false para outro usuário", () => {
            const sessao = criarSessao();

            expect(sessao.estaValidaPara(Id.criar().resultado)).toBe(false);
        });

        it("deve retornar false quando a sessão foi revogada", () => {
            const sessao = criarSessao();

            sessao.revogar();

            expect(sessao.estaValidaPara(dono())).toBe(false);
        });

        it("deve retornar false quando a sessão expirou na data de referência", () => {
            const sessao = criarSessao({
                criadaEm: new Date("2026-01-01T00:00:00Z"),
                expiraEm: new Date("2026-01-01T01:00:00Z"),
            });

            expect(sessao.estaValidaPara(dono(), new Date("2026-01-01T00:30:00Z"))).toBe(true);
            expect(sessao.estaValidaPara(dono(), new Date("2026-01-01T02:00:00Z"))).toBe(false);
        });
    });

    describe("revogar", () => {
        it("deve desativar uma sessão ativa", () => {
            const sessao = criarSessao();

            sessao.revogar();

            expect(sessao.ativo).toBe(false);
        });

        it("deve permanecer desativada ao ser revogada novamente", () => {
            const sessao = criarSessao();

            sessao.revogar();
            sessao.revogar();

            expect(sessao.ativo).toBe(false);
        });

        it("não deve alterar os demais dados da sessão ao revogar", () => {
            const sessao = criarSessao();

            const sidInicial = sessao.sid.valor;
            const usuarioIdInicial = sessao.usuarioId.valor;

            sessao.revogar();

            expect(sessao.sid.valor).toBe(sidInicial);
            expect(sessao.usuarioId.valor).toBe(usuarioIdInicial);
        });
    });
});
