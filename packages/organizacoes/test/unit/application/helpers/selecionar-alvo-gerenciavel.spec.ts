import { describe, expect, it } from "vitest";
import { TipoCargo, VinculoEmpregaticio } from "@saas/shared";

import { selecionarAlvoGerenciavel } from "../../../../src/application/helpers/selecionar-alvo-gerenciavel";
import {
    MembroNaoEncontradoError,
    PermissaoInsuficienteError,
    UltimoProprietarioError,
} from "../../../../src/domain";
import { criarVinculo, novoId } from "../use-cases/fixtures";

describe("selecionarAlvoGerenciavel", () => {
    const organizacaoId = novoId();

    function vinculo(cargo: TipoCargo): VinculoEmpregaticio {
        return criarVinculo({ organizacaoId, cargo });
    }

    it("deve devolver o vínculo do membro alvo quando as regras permitirem", () => {
        const alvo = vinculo(TipoCargo.FUNCIONARIO);

        const resultado = selecionarAlvoGerenciavel([alvo], alvo.usuarioId, TipoCargo.ADMINISTRADOR, true);

        expect(resultado.resultado).toBe(alvo);
    });

    it("deve falhar com MembroNaoEncontradoError quando o alvo não estiver entre os vínculos ativos", () => {
        const resultado = selecionarAlvoGerenciavel([vinculo(TipoCargo.PROPRIETARIO)], vinculo(TipoCargo.FUNCIONARIO).usuarioId, TipoCargo.PROPRIETARIO, true);

        expect(resultado.falha).toBeInstanceOf(MembroNaoEncontradoError);
    });

    it("deve falhar com PermissaoInsuficienteError quando um ADMINISTRADOR mirar um PROPRIETARIO", () => {
        const alvo = vinculo(TipoCargo.PROPRIETARIO);

        const resultado = selecionarAlvoGerenciavel([alvo, vinculo(TipoCargo.PROPRIETARIO)], alvo.usuarioId, TipoCargo.ADMINISTRADOR, true);

        expect(resultado.falha).toBeInstanceOf(PermissaoInsuficienteError);
    });

    it("deve falhar com UltimoProprietarioError quando o alvo for o único PROPRIETARIO e deixar de sê-lo", () => {
        const alvo = vinculo(TipoCargo.PROPRIETARIO);

        const resultado = selecionarAlvoGerenciavel([alvo, vinculo(TipoCargo.ADMINISTRADOR)], alvo.usuarioId, TipoCargo.PROPRIETARIO, true);

        expect(resultado.falha).toBeInstanceOf(UltimoProprietarioError);
    });

    it("deve permitir mexer no único PROPRIETARIO quando ele continuar PROPRIETARIO", () => {
        const alvo = vinculo(TipoCargo.PROPRIETARIO);

        const resultado = selecionarAlvoGerenciavel([alvo], alvo.usuarioId, TipoCargo.PROPRIETARIO, false);

        expect(resultado.resultado).toBe(alvo);
    });
});
