import { describe, expect, it } from "vitest";

import { Usuario } from "../../../../src/domain/entities/usuario.entidade";
import { CriarUsuarioProps } from "../../../../src/domain/entities/usuario.entidade";

describe("Usuario", () => {
    function criarPropsValidas(): CriarUsuarioProps {
        return {
            email: "usuario@teste.com",
            senhaHash: "$2b$10$hashedpassword",
            nome: "João Silva",
        };
    }

    function criarUsuario(alteracoes: Partial<CriarUsuarioProps> = {}): Usuario {
        const resultado = Usuario.criar({
            ...criarPropsValidas(),
            ...alteracoes,
        });

        if (resultado.isFalha) {
            throw resultado.falha;
        }

        return resultado.resultado;
    }

    describe("criar", () => {
        it("deve criar um usuário válido a partir de dados brutos válidos", () => {
            const props = criarPropsValidas();

            const resultado = Usuario.criar(props);

            expect(resultado.isFalha).toBe(false);

            if (resultado.isFalha) {
                throw resultado.falha;
            }

            const usuario = resultado.resultado;

            expect(usuario.email.valor).toBe(props.email);
            expect(usuario.senhaHash.valor).toBe(props.senhaHash);
            expect(usuario.nome.nomeCompleto).toBe(props.nome);
        });

        it("deve gerar um ID quando ele não for informado", () => {
            const usuario = criarUsuario();

            expect(usuario.id.valor).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            );
        });

        it("deve utilizar o ID informado quando ele for fornecido", () => {
            const id = "550e8400-e29b-41d4-a716-446655440000";

            const usuario = criarUsuario({ id });

            expect(usuario.id.valor).toBe(id);
        });

        it("deve gerar IDs diferentes para usuários distintos quando o ID não for informado", () => {
            const usuarioA = criarUsuario();
            const usuarioB = criarUsuario();

            expect(usuarioA.id.valor).not.toBe(usuarioB.id.valor);
        });

        it("deve retornar falha quando o email for inválido", () => {
            const resultado = Usuario.criar({
                ...criarPropsValidas(),
                email: "email-invalido",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando o nome for inválido", () => {
            const resultado = Usuario.criar({
                ...criarPropsValidas(),
                nome: "X",
            });

            expect(resultado.isFalha).toBe(true);
        });

        it("deve retornar falha quando o ID informado estiver mal formatado", () => {
            const resultado = Usuario.criar({
                ...criarPropsValidas(),
                id: "id-invalido",
            });

            expect(resultado.isFalha).toBe(true);
        });
    });
});
