import { describe, expect, it } from "vitest";
import { Id } from "../../../../src/domain/value-objects/id";

import { VinculoEmpregaticio } from "../../../../src/domain/entities/vinculo-empregaticio.entidade";
import { TipoCargo } from "../../../../src/domain/enums/tipo-cargo.enum";
import { IdMalFormatadoError } from "../../../../src/domain/errors/id-mal-formatado-error";

describe("VinculoEmpregaticio", () => {
    function criarPropsValidas() {
        return {
            usuarioId: Id.criar().resultado.valor,
            organizacaoId: Id.criar().resultado.valor,
            cargo: TipoCargo.FUNCIONARIO,
        };
    }

    function criarVinculo(
        alteracoes: Partial<{
            id: string;
            usuarioId: string;
            organizacaoId: string;
            cargo: TipoCargo;
            ativo: boolean;
            criadoEm: Date;
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
                props.usuarioId,
            );

            expect(vinculo.organizacaoId.valor).toBe(
                props.organizacaoId,
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
            const id = Id.criar().resultado.valor;

            const vinculo = criarVinculo({ id });

            expect(vinculo.id.valor).toBe(id);
        });

        it("deve retornar falha quando o ID do usuário estiver mal formatado", () => {
            const resultado = VinculoEmpregaticio.criar({
                ...criarPropsValidas(),
                usuarioId: "usuario-invalido",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando o ID da organização estiver mal formatado", () => {
            const resultado = VinculoEmpregaticio.criar({
                ...criarPropsValidas(),
                organizacaoId: "organizacao-invalida",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it.each(["usuarioId", "organizacaoId"] as const)(
            "deve retornar falha quando %s for vazio, em vez de gerar um ID novo",
            (campo) => {
                const resultado = VinculoEmpregaticio.criar({
                    ...criarPropsValidas(),
                    [campo]: "",
                });

                expect(resultado.isFalha).toBe(true);
                expect(resultado.falha).toBeInstanceOf(IdMalFormatadoError);
            },
        );

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

        it("deve definir a data de criação como agora quando ela não for informada", () => {
            const antes = new Date();

            const vinculo = criarVinculo();

            expect(vinculo.criadoEm.getTime()).toBeGreaterThanOrEqual(antes.getTime());
            expect(vinculo.criadoEm.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it("deve utilizar a data de criação informada", () => {
            const criadoEm = new Date("2026-01-15T10:00:00.000Z");

            const vinculo = criarVinculo({ criadoEm });

            expect(vinculo.criadoEm).toEqual(criadoEm);
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

    describe("ehProprietarioAtivo", () => {
        it("deve ser verdadeiro para um PROPRIETARIO ativo", () => {
            const vinculo = criarVinculo({ cargo: TipoCargo.PROPRIETARIO });

            expect(vinculo.ehProprietarioAtivo()).toBe(true);
        });

        it("deve ser falso para um PROPRIETARIO desativado", () => {
            const vinculo = criarVinculo({ cargo: TipoCargo.PROPRIETARIO, ativo: false });

            expect(vinculo.ehProprietarioAtivo()).toBe(false);
        });

        it.each([TipoCargo.ADMINISTRADOR, TipoCargo.FUNCIONARIO])(
            "deve ser falso para o cargo %s",
            (cargo) => {
                expect(criarVinculo({ cargo }).ehProprietarioAtivo()).toBe(false);
            },
        );
    });

    describe("possuiAlgumCargo", () => {
        it("deve ser verdadeiro quando o cargo do vínculo estiver na lista", () => {
            const vinculo = criarVinculo({ cargo: TipoCargo.ADMINISTRADOR });

            expect(vinculo.possuiAlgumCargo([TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR])).toBe(true);
        });

        it("deve ser falso quando o cargo do vínculo não estiver na lista", () => {
            const vinculo = criarVinculo({ cargo: TipoCargo.FUNCIONARIO });

            expect(vinculo.possuiAlgumCargo([TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR])).toBe(false);
        });

        it("deve ser falso para um vínculo desativado, mesmo com o cargo na lista", () => {
            const vinculo = criarVinculo({ cargo: TipoCargo.PROPRIETARIO, ativo: false });

            expect(vinculo.possuiAlgumCargo([TipoCargo.PROPRIETARIO])).toBe(false);
        });

        it("deve ser falso para uma lista vazia", () => {
            expect(criarVinculo({ cargo: TipoCargo.PROPRIETARIO }).possuiAlgumCargo([])).toBe(false);
        });
    });
});