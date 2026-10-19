import { describe, expect, it } from "vitest";
import { Id, TipoCargo, VinculoEmpregaticio } from "@saas/shared";

import { PoliticaDeCargos } from "../../../../src/domain/services/politica-de-cargos";

describe("PoliticaDeCargos", () => {
    function criarAlvo(cargo: TipoCargo, ativo = true): VinculoEmpregaticio {
        return VinculoEmpregaticio.criar({
            usuarioId: Id.criar().resultado.valor,
            organizacaoId: Id.criar().resultado.valor,
            cargo,
            ativo,
        }).resultado;
    }

    describe("podeGerenciar", () => {
        it.each([TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO])(
            "deve permitir que um PROPRIETARIO gerencie um %s",
            (cargoDoAlvo) => {
                expect(PoliticaDeCargos.podeGerenciar(TipoCargo.PROPRIETARIO, criarAlvo(cargoDoAlvo))).toBe(true);
            },
        );

        it.each([TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO])(
            "deve permitir que um ADMINISTRADOR gerencie um %s",
            (cargoDoAlvo) => {
                expect(PoliticaDeCargos.podeGerenciar(TipoCargo.ADMINISTRADOR, criarAlvo(cargoDoAlvo))).toBe(true);
            },
        );

        it("não deve permitir que um ADMINISTRADOR gerencie um PROPRIETARIO", () => {
            expect(PoliticaDeCargos.podeGerenciar(TipoCargo.ADMINISTRADOR, criarAlvo(TipoCargo.PROPRIETARIO))).toBe(false);
        });

        it("deve permitir que um ADMINISTRADOR gerencie um PROPRIETARIO já desativado", () => {
            expect(
                PoliticaDeCargos.podeGerenciar(TipoCargo.ADMINISTRADOR, criarAlvo(TipoCargo.PROPRIETARIO, false)),
            ).toBe(true);
        });

        it("não deve permitir que um FUNCIONARIO gerencie outro membro", () => {
            expect(PoliticaDeCargos.podeGerenciar(TipoCargo.FUNCIONARIO, criarAlvo(TipoCargo.FUNCIONARIO))).toBe(false);
        });
    });

    describe("podeAtribuir", () => {
        it.each([TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO])(
            "deve permitir que um PROPRIETARIO atribua o cargo %s",
            (cargo) => {
                expect(PoliticaDeCargos.podeAtribuir(TipoCargo.PROPRIETARIO, cargo)).toBe(true);
            },
        );

        it.each([TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO])(
            "deve permitir que um ADMINISTRADOR atribua o cargo %s",
            (cargo) => {
                expect(PoliticaDeCargos.podeAtribuir(TipoCargo.ADMINISTRADOR, cargo)).toBe(true);
            },
        );

        it("não deve permitir que um ADMINISTRADOR atribua o cargo PROPRIETARIO", () => {
            expect(PoliticaDeCargos.podeAtribuir(TipoCargo.ADMINISTRADOR, TipoCargo.PROPRIETARIO)).toBe(false);
        });

        it("não deve permitir que um FUNCIONARIO atribua cargos", () => {
            expect(PoliticaDeCargos.podeAtribuir(TipoCargo.FUNCIONARIO, TipoCargo.FUNCIONARIO)).toBe(false);
        });
    });
});
