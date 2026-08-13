import { IServicoCriptografia } from "@shared/domain/services/servico-criptografia";
import { AutenticarUsuarioCasoDeUso } from "@users/application/use-cases/autenticar-usuario.caso-de-uso";
import { Usuario } from "@users/domain/entities/usuario.entidade";
import { IRepositorioUsuario } from "@users/domain/repositories/usuario.repositorio";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Email } from "@shared/domain/value-objects/email";
import { SenhaHash } from "@users/domain/value-objects/senhaHash";
import { NomeDePessoa } from "@shared/domain/value-objects/nome-de-pessoa";
import { CredenciaisInvalidasError } from "@users/domain/errors/credenciais-invalidas.error";

describe("AutenticarUsuarioCasoDeUso (TDD)", () => {
    let casoDeUso: AutenticarUsuarioCasoDeUso;
    let mockUsuarioRepo: IRepositorioUsuario;
    let mockCriptografia: IServicoCriptografia;
    let usuarioExistente: Usuario;

    beforeEach(() => {
        mockUsuarioRepo = {
            buscarPorEmail: vi.fn(),
            salvar: vi.fn(),
        };

        mockCriptografia = {
            criptografar: vi.fn(),
            comparar: vi.fn(),
        };

        casoDeUso = new AutenticarUsuarioCasoDeUso(mockUsuarioRepo, mockCriptografia);

        // Usuário de teste
        const email = Email.criar("usuario@teste.com").resultado;
        const senhaHash = SenhaHash.criar("$2b$10$hashedpassword").resultado;
        const nome = NomeDePessoa.criar("João Silva").resultado;
        
        usuarioExistente = Usuario.criar({ email, senhaHash, nome }).resultado;
    });

    it("deve autenticar com sucesso quando as credenciais forem válidas", async () => {
        vi.spyOn(mockUsuarioRepo, "buscarPorEmail").mockResolvedValue(usuarioExistente);
        vi.spyOn(mockCriptografia, "comparar").mockResolvedValue(true);

        const comando = {
            email: "usuario@teste.com",
            senha: "SenhaForte123!"
        };

        // Act
        const resultado = await casoDeUso.executar(comando);

        // Assert
        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado).toBe(usuarioExistente);
        expect(mockCriptografia.comparar).toHaveBeenCalledWith("SenhaForte123!", usuarioExistente.senhaHash.valor);
    });

    it("deve falhar se o e-mail não estiver cadastrado", async () => {
        // Arrange
        vi.spyOn(mockUsuarioRepo, "buscarPorEmail").mockResolvedValue(null);

        const comando = {
            email: "nao_existe@teste.com",
            senha: "QualquerSenha123"
        };

        const resultado = await casoDeUso.executar(comando);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(CredenciaisInvalidasError);
    });

    it("deve falhar se a senha estiver incorreta", async () => {
        vi.spyOn(mockUsuarioRepo, "buscarPorEmail").mockResolvedValue(usuarioExistente);
        vi.spyOn(mockCriptografia, "comparar").mockResolvedValue(false); // Senha errada

        const comando = {
            email: "usuario@teste.com",
            senha: "SenhaIncorreta123"
        };

        const resultado = await casoDeUso.executar(comando);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(CredenciaisInvalidasError);
    });

    it("deve retornar falha se o formato do e-mail for inválido", async () => {
        const comando = {
            email: "email-invalido",
            senha: "QualquerSenha123"
        };

        const resultado = await casoDeUso.executar(comando);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha.message).toContain("E-mail inválido"); 
    });
});