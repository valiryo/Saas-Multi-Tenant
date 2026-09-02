import { describe, it, expect, beforeEach, vi } from "vitest";
import { AutenticarUsuarioCasoDeUso } from "../../../../src/application/use-cases/autenticar-usuario.caso-de-uso";
import { IServicoTokenAutenticacao } from "../../../../src/application/ports/servico-token-autenticacao.service";
import {
    Usuario,
    IRepositorioUsuario,
    IServicoCriptografia,
    CredenciaisInvalidasError,
} from "../../../../src/domain";

describe("AutenticarUsuarioCasoDeUso (TDD)", () => {
    let casoDeUso: AutenticarUsuarioCasoDeUso;
    let mockUsuarioRepo: IRepositorioUsuario;
    let mockCriptografia: IServicoCriptografia;
    let mockServicoAutenticacao: IServicoTokenAutenticacao;
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

        mockServicoAutenticacao = {
            gerarTokens: vi.fn(),
        };

        casoDeUso = new AutenticarUsuarioCasoDeUso(mockUsuarioRepo, mockCriptografia, mockServicoAutenticacao);

        // Usuário de teste
        usuarioExistente = Usuario.criar({
            email: "usuario@teste.com",
            senhaHash: "$2b$10$hashedpassword",
            nome: "João Silva",
        }).resultado;
    });

    it("deve autenticar com sucesso quando as credenciais forem válidas", async () => {
        vi.spyOn(mockUsuarioRepo, "buscarPorEmail").mockResolvedValue(usuarioExistente);
        vi.spyOn(mockCriptografia, "comparar").mockResolvedValue(true);

        const tokensEsperados = {
            accessToken: "access-token-fake",
            refreshToken: "refresh-token-fake",
        };
        vi.spyOn(mockServicoAutenticacao, "gerarTokens").mockResolvedValue(tokensEsperados);

        const comando = {
            email: "usuario@teste.com",
            senha: "SenhaForte123!"
        };

        // Act
        const resultado = await casoDeUso.executar(comando);

        // Assert
        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado).toEqual(tokensEsperados);
        expect(mockCriptografia.comparar).toHaveBeenCalledWith("SenhaForte123!", usuarioExistente.senhaHash.valor);
        expect(mockServicoAutenticacao.gerarTokens).toHaveBeenCalledWith({
            sub: usuarioExistente.id.valor,
            email: usuarioExistente.email.valor,
            nome: usuarioExistente.nome.nomeCompleto,
        });
    });

    it("deve falhar se o e-mail não estiver cadastrado", async () => {
        // Arrange
        vi.spyOn(mockUsuarioRepo, "buscarPorEmail").mockResolvedValue(null);

        const comando = {
            email: "nao_existe@teste.com",
            senha: "QualquerSenha123!"
        };

        const resultado = await casoDeUso.executar(comando);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(CredenciaisInvalidasError);
        expect(mockServicoAutenticacao.gerarTokens).not.toHaveBeenCalled();
    });

    it("deve falhar se a senha estiver incorreta", async () => {
        vi.spyOn(mockUsuarioRepo, "buscarPorEmail").mockResolvedValue(usuarioExistente);
        vi.spyOn(mockCriptografia, "comparar").mockResolvedValue(false); // Senha errada

        const comando = {
            email: "usuario@teste.com",
            senha: "SenhaIncorreta123!"
        };

        const resultado = await casoDeUso.executar(comando);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(CredenciaisInvalidasError);
        expect(mockServicoAutenticacao.gerarTokens).not.toHaveBeenCalled();
    });

    it("deve retornar falha se o formato do e-mail for inválido", async () => {
        const comando = {
            email: "email-invalido",
            senha: "QualquerSenha123!"
        };

        const resultado = await casoDeUso.executar(comando);

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha.message).toContain("não é um email válido");
        expect(mockUsuarioRepo.buscarPorEmail).not.toHaveBeenCalled();
    });

    it("deve retornar falha se a senha informada não for forte o suficiente", async () => {
        const comando = {
            email: "usuario@teste.com",
            senha: "fraca"
        };

        const resultado = await casoDeUso.executar(comando);

        expect(resultado.isFalha).toBe(true);
        expect(mockUsuarioRepo.buscarPorEmail).not.toHaveBeenCalled();
    });
});