import { describe, expect, it } from "vitest";
import { Id } from "../../../../src/domain/value-objects/id";

import { VinculoEmpregaticio } from "../../../../src/domain/entities/vinculo-empregaticio.entidade";
import { TipoCargo } from "../../../../src/domain/enums/tipo-cargo.enum";

describe("VinculoEmpregaticio", () => {
    function criarPropsValidas() {
        return {
            usuarioId: Id.criar().resultado,
            organizacaoId: Id.criar().resultado,
            cargo: TipoCargo.FUNCIONARIO,
        };
    }

    function criarVinculo(
        alteracoes: Partial<{
            id: Id;
            usuarioId: Id;
            organizacaoId: Id;
            cargo: TipoCargo;
            ativo: boolean;
        }> = {},
    ): VinculoEmpregaticio {
        const resultado = VinculoEmpregaticio.criar({
            ...criarPropsValidas(),
            ...alteracoes,
        });

        if (resultado.isFalha) {
            throw resultado.falha;
        }

        return resultado.resultado;
    }

    describe("criar", () => {
        it("deve criar um vínculo empregatício válido", () => {
            const props = criarPropsValidas();

            const resultado = VinculoEmpregaticio.criar(props);

            expect(resultado.isFalha).toBe(false);

            if (resultado.isFalha) {
                throw resultado.falha;
            }

            const vinculo = resultado.resultado;

            expect(vinculo.usuarioId.valor).toBe(
                props.usuarioId.valor,
            );

            expect(vinculo.organizacaoId.valor).toBe(
                props.organizacaoId.valor,
            );

            expect(vinculo.cargo).toBe(
                TipoCargo.FUNCIONARIO,
            );

            expect(vinculo.estaAtivo).toBe(true);
        });

        it("deve gerar um ID quando ele não for informado", () => {
            const vinculo = criarVinculo();

            expect(vinculo.id.valor).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            );
        });

        it("deve utilizar o ID informado", () => {
            const id = Id.criar().resultado;

            const vinculo = criarVinculo({ id });

            expect(vinculo.id.valor).toBe(id.valor);
        });

        it("deve criar o vínculo ativo por padrão", () => {
            const vinculo = criarVinculo();

            expect(vinculo.estaAtivo).toBe(true);
        });

        it("deve permitir criar um vínculo desativado", () => {
            const vinculo = criarVinculo({
                ativo: false,
            });

            expect(vinculo.estaAtivo).toBe(false);
        });
    });

    describe("alterarCargo", () => {
        it("deve alterar o cargo do vínculo empregatício", () => {
            const vinculo = criarVinculo({
                cargo: TipoCargo.FUNCIONARIO,
            });

            vinculo.alterarCargo(
                TipoCargo.ADMINISTRADOR,
            );

            expect(vinculo.cargo).toBe(
                TipoCargo.ADMINISTRADOR,
            );
        });

        it("não deve alterar o estado do vínculo ao alterar o cargo", () => {
            const vinculo = criarVinculo({
                cargo: TipoCargo.FUNCIONARIO,
                ativo: false,
            });

            vinculo.alterarCargo(
                TipoCargo.ADMINISTRADOR,
            );

            expect(vinculo.cargo).toBe(
                TipoCargo.ADMINISTRADOR,
            );

            expect(vinculo.estaAtivo).toBe(false);
        });

        it("não deve alterar os identificadores ao alterar o cargo", () => {
            const vinculo = criarVinculo();

            const idInicial = vinculo.id.valor;
            const usuarioIdInicial =
                vinculo.usuarioId.valor;
            const organizacaoIdInicial =
                vinculo.organizacaoId.valor;

            vinculo.alterarCargo(
                TipoCargo.ADMINISTRADOR,
            );

            expect(vinculo.id.valor).toBe(idInicial);

            expect(vinculo.usuarioId.valor).toBe(
                usuarioIdInicial,
            );

            expect(vinculo.organizacaoId.valor).toBe(
                organizacaoIdInicial,
            );
        });
    });

    describe("ativar", () => {
        it("deve ativar um vínculo desativado", () => {
            const vinculo = criarVinculo({
                ativo: false,
            });

            vinculo.ativar();

            expect(vinculo.estaAtivo).toBe(true);
        });

        it("deve permanecer ativo ao ser ativado novamente", () => {
            const vinculo = criarVinculo({
                ativo: true,
            });

            vinculo.ativar();
            vinculo.ativar();

            expect(vinculo.estaAtivo).toBe(true);
        });

        it("não deve alterar o cargo ao ativar o vínculo", () => {
            const vinculo = criarVinculo({
                cargo: TipoCargo.ADMINISTRADOR,
                ativo: false,
            });

            vinculo.ativar();

            expect(vinculo.estaAtivo).toBe(true);

            expect(vinculo.cargo).toBe(
                TipoCargo.ADMINISTRADOR,
            );
        });
    });

    describe("desativar", () => {
        it("deve desativar um vínculo ativo", () => {
            const vinculo = criarVinculo({
                ativo: true,
            });

            vinculo.desativar();

            expect(vinculo.estaAtivo).toBe(false);
        });

        it("deve permanecer desativado ao ser desativado novamente", () => {
            const vinculo = criarVinculo({
                ativo: false,
            });

            vinculo.desativar();
            vinculo.desativar();

            expect(vinculo.estaAtivo).toBe(false);
        });

        it("não deve alterar o cargo ao desativar o vínculo", () => {
            const vinculo = criarVinculo({
                cargo: TipoCargo.ADMINISTRADOR,
                ativo: true,
            });

            vinculo.desativar();

            expect(vinculo.estaAtivo).toBe(false);

            expect(vinculo.cargo).toBe(
                TipoCargo.ADMINISTRADOR,
            );
        });
    });
});