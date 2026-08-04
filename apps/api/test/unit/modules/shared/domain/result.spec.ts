import { describe, it, expect } from 'vitest';
import { Result } from '../../../../../src/modules/shared/domain/value-objects/result';
import { DomainError } from '../../../../../src/modules/shared/domain/errors/erro-de-dominio';

// Mock de um erro para teste
class TestError extends DomainError {
    constructor() { super('Erro de teste'); }
}

describe('Result Value Object', () => {
    it('deve criar um resultado de sucesso', () => {
        const result = Result.ok('sucesso');
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe('sucesso');
    });

    it('deve criar um resultado de falha', () => {
        const error = new TestError();
        const result = Result.fail(error);
        expect(result.isFailure).toBe(true);
        expect(result.error).toBe(error);
    });

    it('deve lançar erro ao acessar value em uma falha', () => {
        const result = Result.fail(new TestError());
        expect(() => result.value).toThrow("Não é possível acessar o valor de um resultado falho.");
    });
});