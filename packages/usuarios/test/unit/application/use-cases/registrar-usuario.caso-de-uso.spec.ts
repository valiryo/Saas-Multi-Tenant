import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrarUsuarioCasoDeUso } from '../../../../src/application/use-cases/registrar-usuario.caso-de-uso';
import { IRepositorioUsuario, IServicoCriptografia, UsuarioJaExistenteError } from '../../../../src/domain';

describe('RegistrarUsuarioCasoDeUso', () => {
    let sut: RegistrarUsuarioCasoDeUso; // System Under Test
    let userRepository: IRepositorioUsuario;
    let cryptoService: IServicoCriptografia;

    beforeEach(() => {
        // Criando Mocks das Interfaces (Ports)
        userRepository = {
            buscarPorEmail: vi.fn(),
            salvar: vi.fn(),
        } as unknown as IRepositorioUsuario;

        cryptoService = {
            criptografar: vi.fn().mockReturnValue('hashed_password'),
            comparar: vi.fn(),
        } as unknown as IServicoCriptografia;

        sut = new RegistrarUsuarioCasoDeUso(userRepository, cryptoService);
    });

    it('deve registrar um novo usuário com sucesso', async () => {
        const input = {
            nome: 'Test User',
            email: 'test@example.com',
            senha: 'Password123!',
        };

        // Lógica 1: Mockando buscarPorEmail para retornar null (usuário não existe)
        vi.spyOn(userRepository, 'buscarPorEmail').mockResolvedValue(null);

        const result = await sut.executar(input);

        // Lógica 2: Validando o retorno do caso de uso
        expect(result.isSucesso).toBe(true);
        expect(result.resultado.email.valor).toBe(input.email);
        expect(userRepository.salvar).toHaveBeenCalled();
    });

    it('não deve permitir registro com email duplicado', async () => {
        const input = {
            nome: 'Test User 2',
            email: 'existing@example.com',
            senha: 'Password123!',
        };

        // Lógica 1: Mockando para retornar um usuário (email já em uso)
        // Aqui simulamos que o repositório achou algo
        vi.spyOn(userRepository, 'buscarPorEmail').mockResolvedValue({} as any);

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(result.falha).toBeInstanceOf(UsuarioJaExistenteError);
        expect(userRepository.salvar).not.toHaveBeenCalled();
    });

    it('não deve registrar com um email em formato inválido', async () => {
        const input = {
            nome: 'Test User',
            email: 'email-invalido',
            senha: 'Password123!',
        };

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(userRepository.buscarPorEmail).not.toHaveBeenCalled();
        expect(userRepository.salvar).not.toHaveBeenCalled();
    });

    it('não deve registrar com uma senha fraca', async () => {
        const input = {
            nome: 'Test User',
            email: 'test@example.com',
            senha: 'fraca',
        };

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(userRepository.buscarPorEmail).not.toHaveBeenCalled();
        expect(userRepository.salvar).not.toHaveBeenCalled();
    });

    it('não deve registrar com um nome inválido', async () => {
        const input = {
            nome: 'X',
            email: 'test@example.com',
            senha: 'Password123!',
        };

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(userRepository.buscarPorEmail).not.toHaveBeenCalled();
        expect(userRepository.salvar).not.toHaveBeenCalled();
    });
});
