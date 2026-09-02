import { describe, expect, it } from "vitest";

import { SenhaHash } from "../../../../src/domain/value-objects/senhaHash";
import { SenhaHashInvalidaError } from "../../../../src/domain/errors/senhaHash-invalida.error";

describe("SenhaHash", () => {
    describe("criar", () => {
        it("deve criar um hash de senha válido", () => {
            const resultado = SenhaHash.criar("$2b$10$hashedpassword");

            expect(resultado.isFalha).toBe(false);

            if (resultado.isFalha) {
                throw resultado.falha;
            }

            expect(resultado.resultado.valor).toBe("$2b$10$hashedpassword");
        });

        it("deve falhar se o hash estiver vazio", () => {
            const resultado = SenhaHash.criar("");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(SenhaHashInvalidaError);
        });

        it("deve falhar se o hash contiver apenas espaços em branco", () => {
            const resultado = SenhaHash.criar("   ");

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(SenhaHashInvalidaError);
        });
    });
});
