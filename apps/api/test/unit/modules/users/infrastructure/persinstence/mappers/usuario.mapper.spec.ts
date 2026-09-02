import { describe, expect, it } from 'vitest';

import { Usuario } from '@saas/usuarios';

import {
  PrismaUsuarioMapper,
  type PrismaUsuarioSchema,
} from '@users/infrastructure/persistence/mappers/prisma-usuario.mapper';

describe('PrismaUsuarioMapper', () => {
  const usuarioId =
    '550e8400-e29b-41d4-a716-446655440000';

  const nome = 'João Silva';
  const email = 'teste@exemplo.com';

  const senhaHash =
    '$2b$12$LQv3c1yqBWj2gWQ6QxR8zO8Xv9OqYw8NQ1pA7jz7Y9K2mF1sT3uQe';

  function criarDadosPrisma(
    sobrescritas: Partial<PrismaUsuarioSchema> = {},
  ): PrismaUsuarioSchema {
    return {
      id: usuarioId,
      nome,
      email,
      senhaHash,
      criadoEm: new Date(
        '2026-08-04T12:00:00.000Z',
      ),
      ...sobrescritas,
    };
  }

  function criarUsuario(): Usuario {
    const resultado = Usuario.criar({
      id: usuarioId,
      nome,
      email,
      senhaHash,
    });

    expect(resultado.isSucesso).toBe(true);

    return resultado.resultado;
  }

  describe('paraDominio', () => {
    it('deve converter os dados do Prisma para uma entidade Usuario', () => {
      const dadosPrisma = criarDadosPrisma();

      const resultado =
        PrismaUsuarioMapper.paraDominio(dadosPrisma);

      expect(resultado.isSucesso).toBe(true);
      expect(resultado.isFalha).toBe(false);

      const usuario = resultado.resultado;

      expect(usuario).toBeInstanceOf(Usuario);
      expect(usuario.id.valor).toBe(usuarioId);
      expect(usuario.nome.nomeCompleto).toBe(nome);
      expect(usuario.email.valor).toBe(email);
      expect(usuario.senhaHash.valor).toBe(senhaHash);
    });

    it('deve propagar uma falha ao receber dados inválidos', () => {
      const dadosPrisma = criarDadosPrisma({
        email: 'email-invalido',
      });

      const resultado =
        PrismaUsuarioMapper.paraDominio(dadosPrisma);

      expect(resultado.isFalha).toBe(true);
      expect(resultado.isSucesso).toBe(false);
      expect(resultado.falha).toBeDefined();
    });
  });

  describe('paraPersistencia', () => {
    it('deve converter uma entidade Usuario para os dados de persistência', () => {
      const usuario = criarUsuario();

      const dadosPersistencia =
        PrismaUsuarioMapper.paraPersistencia(usuario);

      expect(dadosPersistencia).toStrictEqual({
        id: usuarioId,
        nome,
        email,
        senhaHash,
      });
    });
  });
});