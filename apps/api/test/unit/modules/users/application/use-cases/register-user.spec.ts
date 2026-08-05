import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IRepositorioUsuario } from 'src/modules/usuarios/domain/repositories/usuario.repositorio';
import { ServicoCriptografia } from '@shared/domain/repositories/servico-criptografia';
import { RegistrarUsuarioCasoDeUso } from '@users/application/use-cases/register-user';
import { Email } from '@shared/domain/value-objects/email';
import { SenhaForte } from '@users/domain/value-objects/senhaForte';
import { NomeDePessoa } from '@shared/domain/value-objects/nome-de-pessoa';
import { UsuarioJaExistenteError } from '@users/domain/errors/usuario-ja-existente.error';

describe('RegistrarUsuarioCasoDeUso', () => {
    let sut: RegistrarUsuarioCasoDeUso; // System Under Test
    let userRepository: IRepositorioUsuario;
    let cryptoService: ServicoCriptografia;

    beforeEach(() => {
        // Criando Mocks das Interfaces (Ports)
        userRepository = {
            buscarPorEmail: vi.fn(),
            salvar: vi.fn(),
        } as unknown as IRepositorioUsuario;

        cryptoService = {
            criptografar: vi.fn().mockReturnValue('hashed_password'),
            comparar: vi.fn(),
        } as unknown as ServicoCriptografia;

        sut = new RegistrarUsuarioCasoDeUso(userRepository, cryptoService);
    });

    it('deve registrar um novo usuário com sucesso', async () => {
        const input = {
            nome: NomeDePessoa.criar('Test User').resultado,
            email: Email.criar('test@example.com').resultado,
            senha: SenhaForte.criar('Password123!').resultado,
        };

        // Lógica 1: Mockando buscarPorEmail para retornar null (usuário não existe)
        vi.spyOn(userRepository, 'buscarPorEmail').mockResolvedValue(null);

        const result = await sut.executar(input);

        // Lógica 2: Validando o retorno do caso de uso
        expect(result.isSucesso).toBe(true);
        expect(result.resultado.email.valor).toBe(input.email.valor);
        expect(userRepository.salvar).toHaveBeenCalled();
    });

    it('não deve permitir registro com email duplicado', async () => {
        const input = {
            nome: NomeDePessoa.criar('Test User 2').resultado,
            email: Email.criar('existing@example.com').resultado,
            senha: SenhaForte.criar('Password123!').resultado,
        };

        // Lógica 1: Mockando para retornar um usuário (email já em uso)
        // Aqui simulamos que o repositório achou algo
        vi.spyOn(userRepository, 'buscarPorEmail').mockResolvedValue({} as any);

        const result = await sut.executar(input);

        expect(result.isFalha).toBe(true);
        expect(result.falha).toBeInstanceOf(UsuarioJaExistenteError);
        expect(userRepository.salvar).not.toHaveBeenCalled();
    });
});