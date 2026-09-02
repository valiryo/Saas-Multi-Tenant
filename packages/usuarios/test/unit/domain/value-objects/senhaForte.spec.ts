import { describe, expect, it } from "vitest";

import { SenhaForte } from "../../../../src/domain/value-objects/senhaForte";
import { SenhaForteInvalidaError } from "../../../../src/domain/errors/senhaForte-invalida.error";

describe("SenhaForte", () => {
    describe("criar", () => {
        it("deve criar uma senha válida quando todos os critérios forem atendidos", () => {
            const resultado = SenhaForte.criar("Senha123!");

            expect(resultado.isFalha).toBe(false);

            if (resultado.isFalha) {
                throw resultado.falha;
            }

            expect(resultado.resultado.valor).toBe("Senha123!");
        });

        it("deve falhar se a senha estiver vazia", () => {
            const resultado = SenhaForte.criar("");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(SenhaForteInvalidaError);
        });

        it("deve falhar se a senha tiver menos de 8 caracteres", () => {
            const resultado = SenhaForte.criar("Ab1!");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("entre 8 e 128 caracteres");
        });

        it("deve falhar se a senha não tiver letra minúscula", () => {
            const resultado = SenhaForte.criar("SENHA123!");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("letra minúscula");
        });

        it("deve falhar se a senha não tiver letra maiúscula", () => {
            const resultado = SenhaForte.criar("senha123!");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("letra maiúscula");
        });

        it("deve falhar se a senha não tiver número", () => {
            const resultado = SenhaForte.criar("SenhaForte!");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("número");
        });

        it("deve falhar se a senha não tiver caractere especial", () => {
            const resultado = SenhaForte.criar("Senha1234");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("caractere especial");
        });

        it("deve falhar se a senha contiver espaços", () => {
            const resultado = SenhaForte.criar("Senha 123!");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("espaços");
        });

        it("deve acumular todas as violações quando a senha ferir múltiplas regras", () => {
            const resultado = SenhaForte.criar("abc");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha.message).toContain("entre 8 e 128 caracteres");
            expect(resultado.falha.message).toContain("letra maiúscula");
            expect(resultado.falha.message).toContain("número");
            expect(resultado.falha.message).toContain("caractere especial");
        });
    });
});
