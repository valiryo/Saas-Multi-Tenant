import { describe, it, expect } from 'vitest';
import { Id } from '../../../../src/domain/value-objects/id';
import { IdMalFormatadoError } from '../../../../src/domain/errors/id-mal-formatado-error';

describe('Id Value Object', () => {
    it('deve gerar um uuid quando nenhum valor for informado', () => {
        const resultado = Id.criar();

        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado.valor).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
    });

    it('deve falhar quando o valor for mal formatado', () => {
        const resultado = Id.criar('id-invalido');

        expect(resultado.isFalha).toBe(true);
        expect(resultado.falha).toBeInstanceOf(IdMalFormatadoError);
    });

    describe('equals', () => {
        it('deve retornar true para ids com o mesmo valor', () => {
            const valor = '550e8400-e29b-41d4-a716-446655440000';

            expect(Id.criar(valor).resultado.equals(Id.criar(valor).resultado)).toBe(true);
        });

        it('deve retornar false para ids diferentes', () => {
            expect(Id.criar().resultado.equals(Id.criar().resultado)).toBe(false);
        });
    });
});
