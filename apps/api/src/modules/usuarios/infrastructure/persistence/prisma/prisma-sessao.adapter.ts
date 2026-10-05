import { Injectable } from "@nestjs/common";

import { Id } from "@saas/shared";

import {
  IRepositorioSessao,
  Sessao,
} from "@saas/usuarios";

import { PrismaService } from "src/modules/database/services/prisma.service";

import {
  PrismaSessaoMapper,
  type PrismaSessaoSchema,
} from "../mappers/prisma-sessao.mapper";

@Injectable()
export class PrismaSessaoAdapter
  implements IRepositorioSessao
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  public async salvar(
    sessao: Sessao,
  ): Promise<void> {
    const dadosPersistencia =
      PrismaSessaoMapper.paraPersistencia(
        sessao,
      );

    await this.prisma.sessao.upsert({
      where: {
        id: dadosPersistencia.id,
      },

      create: {
        id: dadosPersistencia.id,
        usuarioId:
          dadosPersistencia.usuarioId,
        userAgent:
          dadosPersistencia.userAgent,
        ipAddress:
          dadosPersistencia.ipAddress,
        ativo:
          dadosPersistencia.ativo,
        criadoEm:
          dadosPersistencia.criadoEm,
        expiraEm:
          dadosPersistencia.expiraEm,
      },

      update: {
        ativo:
          dadosPersistencia.ativo,
      },
    });
  }

  public async buscarPorId(
    id: Id,
  ): Promise<Sessao | null> {
    const dadosPrisma =
      await this.prisma.sessao.findUnique({
        where: {
          id: id.valor,
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(
      dadosPrisma,
    );
  }

  public async buscarAtivasPorUsuarioId(
    usuarioId: Id,
  ): Promise<Sessao[]> {
    const dadosPrisma =
      await this.prisma.sessao.findMany({
        where: {
          usuarioId: usuarioId.valor,
          ativo: true,
          expiraEm: {
            gt: new Date(),
          },
        },
      });

    return dadosPrisma.map(
      (dados) =>
        this.converterParaDominio(dados),
    );
  }

  public async revogarTodasDoUsuario(
    usuarioId: Id,
    excetoSessaoId?: Id,
  ): Promise<void> {
    await this.prisma.sessao.updateMany({
      where: {
        usuarioId: usuarioId.valor,
        ativo: true,

        ...(excetoSessaoId && {
          id: {
            not: excetoSessaoId.valor,
          },
        }),
      },

      data: {
        ativo: false,
      },
    });
  }

  private converterParaDominio(
    dadosPrisma: PrismaSessaoSchema,
  ): Sessao {
    const resultado =
      PrismaSessaoMapper.paraDominio(
        dadosPrisma,
      );

    if (resultado.isFalha) {
      throw resultado.falha;
    }

    return resultado.resultado;
  }
}