import { describe, expect, it } from 'vitest';

import { IdMalFormatadoError, IpInvalidoError } from '@saas/shared';
import { Sessao } from '@saas/usuarios';

import {
  PrismaSessaoMapper,
  type PrismaSessaoSchema,
} from '@users/infrastructure/persistence/mappers/prisma-sessao.mapper';

describe('PrismaSessaoMapper', () => {
  const sid = '550e8400-e29b-41d4-a716-446655440001';
  const usuarioId = '550e8400-e29b-41d4-a716-446655440000';
  const criadoEm = new Date('2026-01-01T00:00:00.000Z');
  const expiraEm = new Date('2999-01-01T00:00:00.000Z');

  function criarDadosPrisma(
    sobrescritas: Partial<PrismaSessaoSchema> = {},
  ): PrismaSessaoSchema {
    return {
      id: sid,
      usuarioId,
      userAgent: 'Mozilla/5.0',
      ipAddress: '127.0.0.1',
      ativo: true,
      criadoEm,
      expiraEm,
      ...sobrescritas,
    };
  }

  describe('paraDominio', () => {
    it('deve converter os dados do Prisma para uma entidade Sessao', () => {
      const resultado = PrismaSessaoMapper.paraDominio(criarDadosPrisma());

      expect(resultado.isSucesso).toBe(true);

      const sessao = resultado.resultado;
      expect(sessao).toBeInstanceOf(Sessao);
      expect(sessao.sid.valor).toBe(sid);
      expect(sessao.usuarioId.valor).toBe(usuarioId);
      expect(sessao.userAgent).toBe('Mozilla/5.0');
      expect(sessao.ipAddress.valor).toBe('127.0.0.1');
      expect(sessao.ativo).toBe(true);
      expect(sessao.criadaEm).toBe(criadoEm);
      expect(sessao.expiraEm).toBe(expiraEm);
    });

    it('deve preservar uma sessão revogada', () => {
      const resultado = PrismaSessaoMapper.paraDominio(
        criarDadosPrisma({ ativo: false }),
      );

      expect(resultado.resultado.ativo).toBe(false);
    });

    it('deve retornar falha quando o id persistido for inválido', () => {
      const resultado = PrismaSessaoMapper.paraDominio(
        criarDadosPrisma({ id: 'id-invalido' }),
      );

      expect(resultado.falha).toBeInstanceOf(IdMalFormatadoError);
    });

    it('deve retornar falha quando o IP persistido for inválido', () => {
      const resultado = PrismaSessaoMapper.paraDominio(
        criarDadosPrisma({ ipAddress: 'ip-invalido' }),
      );

      expect(resultado.falha).toBeInstanceOf(IpInvalidoError);
    });
  });

  describe('paraPersistencia', () => {
    it('deve converter a entidade Sessao para o formato do Prisma', () => {
      const sessao = Sessao.criar({
        sid,
        usuarioId,
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        criadaEm: criadoEm,
        expiraEm,
      }).resultado;

      expect(PrismaSessaoMapper.paraPersistencia(sessao)).toEqual({
        id: sid,
        usuarioId,
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        ativo: true,
        criadoEm,
        expiraEm,
      });
    });

    it('deve persistir ativo=false para uma sessão revogada', () => {
      const sessao = PrismaSessaoMapper.paraDominio(criarDadosPrisma()).resultado;

      sessao.revogar();

      expect(PrismaSessaoMapper.paraPersistencia(sessao).ativo).toBe(false);
    });
  });
});
