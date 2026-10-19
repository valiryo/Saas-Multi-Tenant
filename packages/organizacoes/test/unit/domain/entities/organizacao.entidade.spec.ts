import { describe, expect, it } from "vitest";

import { Organizacao } from "../../../../src/domain/entities/organizacao.entidade";
import { CriarOrganizacaoProps } from "../../../../src/domain/entities/organizacao.entidade";

describe("Organizacao", () => {
    function criarPropsValidas(): CriarOrganizacaoProps {
        return {
            nome: "Empresa Teste",
        };
    }

    function criarOrganizacao(alteracoes: Partial<CriarOrganizacaoProps> = {}): Organizacao {
        const resultado = Organizacao.criar({
            ...criarPropsValidas(),
            ...alteracoes,
        });

        if (resultado.isFalha) {
            throw resultado.falha;
        }

        return resultado.resultado;
    }

    describe("criar", () => {
        it("deve criar uma organização válida a partir de dados brutos válidos", () => {
            const props = criarPropsValidas();

            const resultado = Organizacao.criar(props);

            expect(resultado.isFalha).toBe(false);

            if (resultado.isFalha) {
                throw resultado.falha;
            }

            const organizacao = resultado.resultado;

            expect(organizacao.nome.valor).toBe(props.nome);
        });

        it("deve gerar o slug a partir do nome quando ele não for informado", () => {
            const organizacao = criarOrganizacao({ nome: "Empresa Teste" });

            expect(organizacao.slug.valor).toBe("empresa-teste");
        });

        it("deve normalizar um slug customizado quando fornecido", () => {
            const organizacao = criarOrganizacao({ slug: "Slug Customizado!" });

            expect(organizacao.slug.valor).toBe("slug-customizado");
        });

        it("deve gerar um ID quando ele não for informado", () => {
            const organizacao = criarOrganizacao();

            expect(organizacao.id.valor).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            );
        });

        it("deve utilizar o ID informado quando ele for fornecido", () => {
            const id = "550e8400-e29b-41d4-a716-446655440000";

            const organizacao = criarOrganizacao({ id });

            expect(organizacao.id.valor).toBe(id);
        });

        it("deve definir a data de criação como agora quando ela não for informada", () => {
            const antes = new Date();

            const organizacao = criarOrganizacao();

            expect(organizacao.criadoEm.getTime()).toBeGreaterThanOrEqual(antes.getTime());
            expect(organizacao.criadoEm.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it("deve utilizar a data de criação informada", () => {
            const criadoEm = new Date("2026-01-15T10:00:00.000Z");

            const organizacao = criarOrganizacao({ criadoEm });

            expect(organizacao.criadoEm).toEqual(criadoEm);
        });

        it("deve retornar falha quando o nome for inválido", () => {
            const resultado = Organizacao.criar({
                ...criarPropsValidas(),
                nome: "A",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando o slug informado for inválido mesmo após normalização", () => {
            const resultado = Organizacao.criar({
                ...criarPropsValidas(),
                slug: "!!!",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando o ID informado estiver mal formatado", () => {
            const resultado = Organizacao.criar({
                ...criarPropsValidas(),
                id: "id-invalido",
            });

            expect(resultado.isFalha).toBe(true);
        });
    });
});
