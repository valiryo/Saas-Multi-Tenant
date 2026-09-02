import { describe, expect, it } from "vitest";
import { Email, Id, NomeDePessoa } from "@saas/shared";

import { Usuario } from "../../../../src/domain/entities/usuario.entidade";
import { SenhaHash } from "../../../../src/domain/value-objects/senhaHash";

describe("Usuario", () => {
    function criarPropsValidas() {
        return {
            email: Email.criar("usuario@teste.com").resultado,
            senhaHash: SenhaHash.criar("$2b$10$hashedpassword").resultado,
            nome: NomeDePessoa.criar("João Silva").resultado,
        };
    }

    function criarUsuario(
        alteracoes: Partial<{
            id: Id;
            email: Email;
            senhaHash: SenhaHash;
            nome: NomeDePessoa;
        }> = {},
    ): Usuario {
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
        it("deve criar um usuário válido a partir de value objects válidos", () => {
            const props = criarPropsValidas();

            const resultado = Usuario.criar(props);

            expect(resultado.isFalha).toBe(false);

            if (resultado.isFalha) {
                throw resultado.falha;
            }

            const usuario = resultado.resultado;

            expect(usuario.email.valor).toBe(props.email.valor);
            expect(usuario.senhaHash.valor).toBe(props.senhaHash.valor);
            expect(usuario.nome.nomeCompleto).toBe(props.nome.nomeCompleto);
        });

        it("deve gerar um ID quando ele não for informado", () => {
            const usuario = criarUsuario();

            expect(usuario.id.valor).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            );
        });

        it("deve utilizar o ID informado quando ele for fornecido", () => {
            const id = Id.criar().resultado;

            const usuario = criarUsuario({ id });

            expect(usuario.id.valor).toBe(id.valor);
        });

        it("deve gerar IDs diferentes para usuários distintos quando o ID não for informado", () => {
            const usuarioA = criarUsuario();
            const usuarioB = criarUsuario();

            expect(usuarioA.id.valor).not.toBe(usuarioB.id.valor);
        });
    });
});
