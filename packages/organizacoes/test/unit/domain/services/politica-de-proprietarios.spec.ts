import { describe, expect, it } from "vitest";
import { Id, TipoCargo, VinculoEmpregaticio } from "@saas/shared";

import { PoliticaDeProprietarios } from "../../../../src/domain/services/politica-de-proprietarios";

describe("PoliticaDeProprietarios", () => {
    const organizacaoId = Id.criar().resultado.valor;

    function criarVinculo(cargo: TipoCargo, ativo = true): VinculoEmpregaticio {
        return VinculoEmpregaticio.criar({
            usuarioId: Id.criar().resultado.valor,
            organizacaoId,
            cargo,
            ativo,
        }).resultado;
    }

    describe("podeDeixarDeSerProprietario", () => {
        it("deve permitir quando o alvo não for PROPRIETARIO", () => {
            const alvo = criarVinculo(TipoCargo.ADMINISTRADOR);

            expect(PoliticaDeProprietarios.podeDeixarDeSerProprietario(alvo, [alvo])).toBe(true);
        });

        it("deve permitir quando existir outro PROPRIETARIO ativo", () => {
            const alvo = criarVinculo(TipoCargo.PROPRIETARIO);
            const outroProprietario = criarVinculo(TipoCargo.PROPRIETARIO);

            expect(
                PoliticaDeProprietarios.podeDeixarDeSerProprietario(alvo, [alvo, outroProprietario]),
            ).toBe(true);
        });

        it("não deve permitir quando o alvo for o único PROPRIETARIO ativo", () => {
            const alvo = criarVinculo(TipoCargo.PROPRIETARIO);
            const administrador = criarVinculo(TipoCargo.ADMINISTRADOR);

            expect(
                PoliticaDeProprietarios.podeDeixarDeSerProprietario(alvo, [alvo, administrador]),
            ).toBe(false);
        });

        it("não deve contar PROPRIETARIOS desativados", () => {
            const alvo = criarVinculo(TipoCargo.PROPRIETARIO);
            const proprietarioDesativado = criarVinculo(TipoCargo.PROPRIETARIO, false);

            expect(
                PoliticaDeProprietarios.podeDeixarDeSerProprietario(alvo, [alvo, proprietarioDesativado]),
            ).toBe(false);
        });

        it("não deve permitir quando a lista estiver vazia e o alvo for PROPRIETARIO", () => {
            const alvo = criarVinculo(TipoCargo.PROPRIETARIO);

            expect(PoliticaDeProprietarios.podeDeixarDeSerProprietario(alvo, [])).toBe(false);
        });
    });
});
