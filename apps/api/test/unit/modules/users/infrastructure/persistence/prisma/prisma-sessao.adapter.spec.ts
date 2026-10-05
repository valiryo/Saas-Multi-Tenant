import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Id } from '@saas/shared';
import { Sessao } from '@saas/usuarios';

import type { PrismaService } from 'src/modules/database/services/prisma.service';
import type { PrismaSessaoSchema } from '@users/infrastructure/persistence/mappers/prisma-sessao.mapper';
import { PrismaSessaoAdapter } from '@users/infrastructure/persistence/prisma/prisma-sessao.adapter';

describe('PrismaSessaoAdapter', () => {
  const usuarioId = '550e8400-e29b-41d4-a716-446655440000';

  function criarRegistroPrisma(
    sobrescritas: Partial<PrismaSessaoSchema> = {},
  ): PrismaSessaoSchema {
    return {
      id: Id.criar().resultado.valor,
      usuarioId,
      userAgent: 'Mozilla/5.0',
      ipAddress: '127.0.0.1',
      ativo: true,
      criadoEm: new Date(),
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      ...sobrescritas,
    };
  }

  let sessaoPrisma: {
    upsert: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };

  let repositorio: PrismaSessaoAdapter;

  beforeEach(() => {
    sessaoPrisma = {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn(),
    };

    repositorio = new PrismaSessaoAdapter(
      { sessao: sessaoPrisma } as unknown as PrismaService,
    );
  });

  describe('salvar', () => {
    it('deve criar a sessão e, em update, alterar apenas o campo ativo', async () => {
      const sessao = Sessao.criar({
        usuarioId,
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      }).resultado;

      await repositorio.salvar(sessao);

      expect(sessaoPrisma.upsert).toHaveBeenCalledWith({
        where: { id: sessao.sid.valor },
        create: {
          id: sessao.sid.valor,
          usuarioId,
          userAgent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
          ativo: true,
          criadoEm: sessao.criadaEm,
          expiraEm: sessao.expiraEm,
        },
        update: { ativo: true },
      });
    });

    it('deve persistir a revogação', async () => {
      const sessao = Sessao.criar({
        usuarioId,
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      }).resultado;
      sessao.revogar();

      await repositorio.salvar(sessao);

      expect(sessaoPrisma.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { ativo: false } }),
      );
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar a sessão encontrada', async () => {
      const registro = criarRegistroPrisma();
      sessaoPrisma.findUnique.mockResolvedValue(registro);

      const sessao = await repositorio.buscarPorId(Id.criar(registro.id).resultado);

      expect(sessaoPrisma.findUnique).toHaveBeenCalledWith({ where: { id: registro.id } });
      expect(sessao).toBeInstanceOf(Sessao);
      expect(sessao?.sid.valor).toBe(registro.id);
    });

    it('deve retornar null quando a sessão não existir', async () => {
      sessaoPrisma.findUnique.mockResolvedValue(null);

      expect(await repositorio.buscarPorId(Id.criar().resultado)).toBeNull();
    });

    it('deve lançar o erro de domínio quando o registro for inválido', async () => {
      sessaoPrisma.findUnique.mockResolvedValue(criarRegistroPrisma({ ipAddress: 'ip-invalido' }));

      await expect(repositorio.buscarPorId(Id.criar().resultado)).rejects.toThrow();
    });
  });

  describe('buscarAtivasPorUsuarioId', () => {
    it('deve filtrar por usuário, ativas e não expiradas', async () => {
      const registros = [criarRegistroPrisma(), criarRegistroPrisma()];
      sessaoPrisma.findMany.mockResolvedValue(registros);

      const sessoes = await repositorio.buscarAtivasPorUsuarioId(Id.criar(usuarioId).resultado);

      expect(sessaoPrisma.findMany).toHaveBeenCalledWith({
        where: {
          usuarioId,
          ativo: true,
          expiraEm: { gt: expect.any(Date) },
        },
      });
      expect(sessoes.map(s => s.sid.valor)).toEqual(registros.map(r => r.id));
    });
  });

  describe('revogarTodasDoUsuario', () => {
    it('deve revogar todas as sessões ativas do usuário', async () => {
      await repositorio.revogarTodasDoUsuario(Id.criar(usuarioId).resultado);

      expect(sessaoPrisma.updateMany).toHaveBeenCalledWith({
        where: { usuarioId, ativo: true },
        data: { ativo: false },
      });
    });

    it('deve preservar a sessão informada em excetoSessaoId', async () => {
      const sidAtual = Id.criar().resultado;

      await repositorio.revogarTodasDoUsuario(Id.criar(usuarioId).resultado, sidAtual);

      expect(sessaoPrisma.updateMany).toHaveBeenCalledWith({
        where: { usuarioId, ativo: true, id: { not: sidAtual.valor } },
        data: { ativo: false },
      });
    });
  });
});
