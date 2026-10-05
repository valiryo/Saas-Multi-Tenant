import { describe, it, expect } from 'vitest';
import { Ip } from '../../../../src/domain/value-objects/ip';
import { IpInvalidoError } from '../../../../src/domain/errors/ip-invalido.error';
import { ErroDeDominio } from '../../../../src/domain/errors/erro-de-dominio';

describe('Ip Value Object', () => {
    it('deve criar um IPv4 válido', () => {
        const resultado = Ip.criar('192.168.0.1');

        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado.valor).toBe('192.168.0.1');
    });

    it('deve criar um IPv6 válido', () => {
        const resultado = Ip.criar('::1');

        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado.valor).toBe('::1');
    });

    it('deve aceitar IPv4 mapeado em IPv6', () => {
        const resultado = Ip.criar('::ffff:127.0.0.1');

        expect(resultado.isSucesso).toBe(true);
    });

    it('deve remover espaços nas extremidades', () => {
        const resultado = Ip.criar('  10.0.0.1  ');

        expect(resultado.isSucesso).toBe(true);
        expect(resultado.resultado.valor).toBe('10.0.0.1');
    });

    it.each(['ip-invalido', '', '256.0.0.1', '10.0.0'])(
        'deve falhar com IpInvalidoError para "%s"',
        (valor) => {
            const resultado = Ip.criar(valor);

            expect(resultado.isFalha).toBe(true);
            expect(resultado.falha).toBeInstanceOf(IpInvalidoError);
            expect(resultado.falha).toBeInstanceOf(ErroDeDominio);
        },
    );

    it('deve considerar iguais dois IPs com o mesmo valor', () => {
        const a = Ip.criar('127.0.0.1').resultado;
        const b = Ip.criar('127.0.0.1').resultado;
        const c = Ip.criar('127.0.0.2').resultado;

        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
    });
});
