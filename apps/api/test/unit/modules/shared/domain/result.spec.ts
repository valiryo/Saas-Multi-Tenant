import { describe, it, expect } from 'vitest';
import { Result } from '../../../../../src/modules/shared/domain/value-objects/result';
import { ErroDeDominio } from '../../../../../src/modules/shared/domain/errors/erro-de-dominio';

// Mock de um erro para teste
class TestError extends ErroDeDominio {
    constructor() { super('Erro de teste'); }
}

describe('Result Value Object', () => {
    it('deve criar um resultado de sucesso', () => {
        const result = Result.passar('sucesso');
        expect(result.isSucesso).toBe(true);
        expect(result.resultado).toBe('sucesso');
    });

    it('deve criar um resultado de falha', () => {
        const error = new TestError();
        const result = Result.falhar(error);
        expect(result.isFalha).toBe(true);
        expect(result.falha).toBe(error);
    });

    it('deve lançar erro ao acessar value em uma falha', () => {
        const result = Result.falhar(new TestError());
        expect(() => result.resultado).toThrow("Não é possível acessar o valor de um resultado falho.");
    });
});