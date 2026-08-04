import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from 'src/modules/usuarios/application/use-cases/register-user';
import { IUserRepository } from 'src/modules/usuarios/domain/repositories/usuario.repositorio';
import { ServicoCriptografia } from '@shared/domain/repositories/servico-criptografia';
import { Email } from '@shared/domain/value-objects/email';

describe('RegisterUserUseCase', () => {
    let sut: RegisterUserUseCase; // System Under Test
    let userRepository: IUserRepository;
    let cryptoService: ServicoCriptografia;

    beforeEach(() => {
        // Criando Mocks das Interfaces (Ports)
        userRepository = {
            findByEmail: vi.fn(),
            save: vi.fn(),
        } as unknown as IUserRepository;

        cryptoService = {
            criptografar: vi.fn().mockReturnValue('hashed_password'),
            comparar: vi.fn(),
        } as unknown as ServicoCriptografia;

        sut = new RegisterUserUseCase(userRepository, cryptoService);
    });

    it('deve registrar um novo usuário com sucesso', async () => {
        const input = {
            email: 'test@example.com',
            senha: 'Password123!',
        };

        // Lógica 1: Mockando findByEmail para retornar null (usuário não existe)
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

        const result = await sut.execute(input);

        // Lógica 2: Validando o retorno do caso de uso
        expect(result.isSuccess).toBe(true);
        expect(result.value.email.valor).toBe(input.email);
        expect(userRepository.save).toHaveBeenCalled();
    });

    it('não deve permitir registro com email duplicado', async () => {
        const input = {
            email: 'existing@example.com',
            senha: 'Password123!',
        };

        // Lógica 1: Mockando para retornar um usuário (email já em uso)
        // Aqui simulamos que o repositório achou algo
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({} as any);

        const result = await sut.execute(input);

        expect(result.isFailure).toBe(true);
        expect(result.error.message).toContain('já está em uso');
        expect(userRepository.save).not.toHaveBeenCalled();
    });
});