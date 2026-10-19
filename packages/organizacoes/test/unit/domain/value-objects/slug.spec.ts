import { describe, expect, it } from "vitest";

import { Slug } from "../../../../src/domain/value-objects/slug";
import { SlugInvalidoError } from "../../../../src/domain/errors/slug-invalido.error";

describe("Slug", () => {
    function criarSlug(valorBruto: string): Slug {
        const resultado = Slug.criar(valorBruto);

        if (resultado.isFalha) {
            throw resultado.falha;
        }

        return resultado.resultado;
    }

    describe("criar", () => {
        it("deve manter um slug que já está no formato correto", () => {
            expect(criarSlug("empresa-teste").valor).toBe("empresa-teste");
        });

        it("deve converter para minúsculas e trocar espaços por hífen", () => {
            expect(criarSlug("Empresa Teste").valor).toBe("empresa-teste");
        });

        it("deve remover acentos", () => {
            expect(criarSlug("Padaria São João").valor).toBe("padaria-sao-joao");
        });

        it("deve remover caracteres especiais", () => {
            expect(criarSlug("Empresa & Cia. Ltda!").valor).toBe("empresa-cia-ltda");
        });

        it("deve colapsar hífens e espaços repetidos em um único hífen", () => {
            expect(criarSlug("empresa --  teste").valor).toBe("empresa-teste");
        });

        it("deve remover hífens das pontas", () => {
            expect(criarSlug("  -Empresa Teste- ").valor).toBe("empresa-teste");
        });

        it("deve aceitar números", () => {
            expect(criarSlug("Loja 24 Horas").valor).toBe("loja-24-horas");
        });

        it("deve aceitar exatamente 3 caracteres", () => {
            expect(criarSlug("abc").valor).toBe("abc");
        });

        it("deve aceitar exatamente 63 caracteres", () => {
            const valor = "a".repeat(63);

            expect(criarSlug(valor).valor).toBe(valor);
        });

        it("deve retornar falha quando o slug higienizado tiver menos de 3 caracteres", () => {
            const resultado = Slug.criar("A!");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(SlugInvalidoError);
        });

        it("deve retornar falha quando restarem apenas caracteres especiais", () => {
            const resultado = Slug.criar("!!!");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(SlugInvalidoError);
        });

        it("deve retornar falha quando o slug tiver mais de 63 caracteres", () => {
            const resultado = Slug.criar("a".repeat(64));

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(SlugInvalidoError);
        });

        it("deve retornar falha quando o valor for vazio", () => {
            const resultado = Slug.criar("");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(SlugInvalidoError);
        });
    });
});
