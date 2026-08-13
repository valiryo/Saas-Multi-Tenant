import { describe, it, expect, beforeEach } from 'vitest';
import { BcryptServicoCriptografia } from '@shared/infrastructure/services/bcrypt-servico-criptografia';

describe('BcryptServicoCriptografia', () => {
    let servicoCriptografia: BcryptServicoCriptografia;

    beforeEach(() => {
        servicoCriptografia = new BcryptServicoCriptografia();
    });

    it('deve gerar um hash seguro e diferente da senha em texto limpo', async () => {
        const senhaLimpa = 'SenhaSuperSegura123!';
        
        const hash = await servicoCriptografia.criptografar(senhaLimpa);

        // Garante que o hash foi gerado
        expect(hash).toBeDefined();
        // O hash nunca deve ser igual à senha original
        expect(hash).not.toBe(senhaLimpa);
        expect(hash.length).toBeGreaterThan(20); 
    });

    it('deve retornar true ao comparar a senha correta com o hash correspondente', async () => {
        const senhaLimpa = 'SenhaSuperSegura123!';
        const hash = await servicoCriptografia.criptografar(senhaLimpa);

        const resultado = await servicoCriptografia.comparar(senhaLimpa, hash);

        expect(resultado).toBe(true);
    });

    it('deve retornar false ao comparar uma senha incorreta com o hash correspondente', async () => {
        const senhaLimpa = 'SenhaSuperSegura123!';
        const senhaIncorreta = 'OutraSenhaQualquer123!';
        const hash = await servicoCriptografia.criptografar(senhaLimpa);

        const resultado = await servicoCriptografia.comparar(senhaIncorreta, hash);

        expect(resultado).toBe(false);
    });

    it('deve gerar salts diferentes (hashes diferentes) para a mesma senha', async () => {
        const senhaLimpa = 'SenhaSuperSegura123!';

        // No bcrypt, gerar o hash da mesma senha duas vezes deve produzir strings diferentes
        // devido ao Salt gerado aleatoriamente em cada execução.
        const hashUm = await servicoCriptografia.criptografar(senhaLimpa);
        const hashDois = await servicoCriptografia.criptografar(senhaLimpa);

        expect(hashUm).not.toBe(hashDois);
    });
});