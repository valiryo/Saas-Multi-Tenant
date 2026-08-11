import type {
  Prisma,
  PrismaClient,
} from "database";

import { VinculoEmpregaticio } from
  "@shared/domain/entities/vinculo-empregaticio.entidade";

import { IRepositorioVinculoEmpregaticio } from
  "@shared/domain/repositories/vinculo-empregaticio.repositorio";

import { Id } from
  "@shared/domain/value-objects/id";

import {
  PrismaVinculoEmpregaticioMapper,
  type PrismaVinculoEmpregaticioSchema,
} from "../mappers/prisma-vinculo-empregaticio.mapper";

export class PrismaVinculoEmpregaticioAdapter
  implements IRepositorioVinculoEmpregaticio
{
  public constructor(
    private readonly prisma: PrismaClient,
  ) {}

  public async buscarPorId(
    id: Id,
  ): Promise<VinculoEmpregaticio | null> {
    const dadosPrisma =
      await this.prisma.vinculoEmpregaticio.findUnique({
        where: {
          id: id.valor,
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(dadosPrisma);
  }

  public async buscarPorUsuarioEOrganizacao(
    usuarioId: Id,
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio | null> {
    const dadosPrisma =
      await this.prisma.vinculoEmpregaticio.findUnique({
        where: {
          usuarioId_organizacaoId: {
            usuarioId: usuarioId.valor,
            organizacaoId: organizacaoId.valor,
          },
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(dadosPrisma);
  }

  public async buscarAtivoPorUsuarioEOrganizacao(
    usuarioId: Id,
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio | null> {
    const dadosPrisma =
      await this.prisma.vinculoEmpregaticio.findFirst({
        where: {
          usuarioId: usuarioId.valor,
          organizacaoId: organizacaoId.valor,
          ativo: true,
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(dadosPrisma);
  }

  public async listarPorUsuario(
    usuarioId: Id,
  ): Promise<VinculoEmpregaticio[]> {
    return this.listar({
      usuarioId: usuarioId.valor,
    });
  }

  public async listarAtivosPorUsuario(
    usuarioId: Id,
  ): Promise<VinculoEmpregaticio[]> {
    return this.listar({
      usuarioId: usuarioId.valor,
      ativo: true,
    });
  }

  public async listarPorOrganizacao(
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio[]> {
    return this.listar({
      organizacaoId: organizacaoId.valor,
    });
  }

  public async listarAtivosPorOrganizacao(
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio[]> {
    return this.listar({
      organizacaoId: organizacaoId.valor,
      ativo: true,
    });
  }

  public async salvar(
    vinculo: VinculoEmpregaticio,
  ): Promise<VinculoEmpregaticio> {
    const dadosPersistencia =
      PrismaVinculoEmpregaticioMapper
        .paraPersistencia(vinculo);

    const dadosPrisma =
      await this.prisma.$transaction(
        async (transacao: Prisma.TransactionClient) => {
          const vinculoAtual =
            await transacao.vinculoEmpregaticio
              .findUnique({
                where: {
                  id: vinculo.id.valor,
                },
              });

          if (!vinculoAtual) {
            const vinculoCriado =
              await transacao.vinculoEmpregaticio
                .create({
                  data: dadosPersistencia,
                });

            await transacao
              .historicoVinculoEmpregaticio
              .create({
                data: {
                  vinculoId: vinculoCriado.id,
                  cargo: vinculoCriado.cargo,
                  ativo: vinculoCriado.ativo,
                },
              });

            return vinculoCriado;
          }

          const cargoFoiAlterado =
            vinculoAtual.cargo !==
            dadosPersistencia.cargo;

          const estadoFoiAlterado =
            vinculoAtual.ativo !==
            dadosPersistencia.ativo;

          const houveAlteracao =
            cargoFoiAlterado ||
            estadoFoiAlterado;

          if (!houveAlteracao) {
            return vinculoAtual;
          }

          const vinculoAtualizado =
            await transacao.vinculoEmpregaticio
              .update({
                where: {
                  id: vinculoAtual.id,
                },
                data: {
                  cargo: dadosPersistencia.cargo,
                  ativo: dadosPersistencia.ativo,
                },
              });

          await transacao
            .historicoVinculoEmpregaticio
            .create({
              data: {
                vinculoId: vinculoAtualizado.id,
                cargo: vinculoAtualizado.cargo,
                ativo: vinculoAtualizado.ativo,
              },
            });

          return vinculoAtualizado;
        },
      );

    return this.converterParaDominio(dadosPrisma);
  }

  private async listar(
    filtro: Prisma.VinculoEmpregaticioWhereInput,
  ): Promise<VinculoEmpregaticio[]> {
    const registros =
      await this.prisma.vinculoEmpregaticio.findMany({
        where: filtro,

        orderBy: {
          criadoEm: "asc",
        },
      });

    return registros.map((registro: PrismaVinculoEmpregaticioSchema) =>
      this.converterParaDominio(registro),
    );
  }

  private converterParaDominio(
    dadosPrisma: PrismaVinculoEmpregaticioSchema,
  ): VinculoEmpregaticio {
    const resultado =
      PrismaVinculoEmpregaticioMapper
        .paraDominio(dadosPrisma);

    if (resultado.isFalha) {
      throw resultado.falha;
    }

    return resultado.resultado;
  }
}