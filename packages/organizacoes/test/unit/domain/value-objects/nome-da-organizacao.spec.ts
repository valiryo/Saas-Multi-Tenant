import { describe, expect, it } from "vitest";

import { NomeDaOrganizacao } from "../../../../src/domain/value-objects/nome-da-organizacao";
import { NomeDaOrganizacaoInvalidoError } from "../../../../src/domain/errors/nome-da-organizacao-invalido.error";

describe("NomeDaOrganizacao", () => {
    describe("criar", () => {
        it("deve criar um nome válido", () => {
            const resultado = NomeDaOrganizacao.criar("Empresa Teste");

            expect(resultado.isSucesso).toBe(true);
            expect(resultado.resultado.valor).toBe("Empresa Teste");
        });

        it("deve remover os espaços das pontas", () => {
            const resultado = NomeDaOrganizacao.criar("   Empresa Teste   ");

            expect(resultado.resultado.valor).toBe("Empresa Teste");
        });

        it("deve aceitar exatamente 3 caracteres", () => {
            expect(NomeDaOrganizacao.criar("ABC").isSucesso).toBe(true);
        });

        it("deve aceitar exatamente 100 caracteres", () => {
            expect(NomeDaOrganizacao.criar("a".repeat(100)).isSucesso).toBe(true);
        });

        it("deve retornar falha quando o nome tiver menos de 3 caracteres", () => {
            const resultado = NomeDaOrganizacao.criar("AB");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(NomeDaOrganizacaoInvalidoError);
        });

        it("deve considerar o tamanho sem os espaços das pontas", () => {
            const resultado = NomeDaOrganizacao.criar("  AB  ");

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando o nome tiver mais de 100 caracteres", () => {
            const resultado = NomeDaOrganizacao.criar("a".repeat(101));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(NomeDaOrganizacaoInvalidoError);
        });

        it.each(["", "   "])("deve retornar falha quando o nome for vazio (%j)", (valor) => {
            const resultado = NomeDaOrganizacao.criar(valor);

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("nome obrigatório");
        });
    });
});
