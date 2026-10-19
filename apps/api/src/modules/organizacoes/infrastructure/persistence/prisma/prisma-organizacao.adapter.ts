import { Injectable } from "@nestjs/common";
import type { Prisma } from "database";

import { Id, VinculoEmpregaticio } from "@saas/shared";

import {
  IRepositorioOrganizacao,
  Organizacao,
  OrganizacaoJaExistenteError,
  Slug,
} from "@saas/organizacoes";

import { PrismaService } from "src/modules/database/services/prisma.service";
import { PrismaVinculoEmpregaticioMapper } from "@shared/infrastructure/persistence/mappers/prisma-vinculo-empregaticio.mapper";

import {
  PrismaOrganizacaoMapper,
  type PrismaOrganizacaoSchema,
} from "../mappers/prisma-organizacao.mapper";

// Código do Prisma para violação de restrição única
const PRISMA_UNIQUE_CONSTRAINT = "P2002";

@Injectable()
export class PrismaOrganizacaoAdapter
  implements IRepositorioOrganizacao
{
  public constructor(
    private readonly prisma: PrismaService,
  ) {}

  public async buscarPorId(
    id: Id,
  ): Promise<Organizacao | null> {
    const dadosPrisma =
      await this.prisma.organizacao.findUnique({
        where: {
          id: id.valor,
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(dadosPrisma);
  }

  public async buscarPorSlug(
    slug: Slug,
  ): Promise<Organizacao | null> {
    const dadosPrisma =
      await this.prisma.organizacao.findUnique({
        where: {
          slug: slug.valor,
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(dadosPrisma);
  }

  public async listarPorIds(
    ids: Id[],
  ): Promise<Organizacao[]> {
    if (ids.length === 0) {
      return [];
    }

    const registros =
      await this.prisma.organizacao.findMany({
        where: {
          id: {
            in: ids.map((id) => id.valor),
          },
        },
      });

    return registros.map((registro: PrismaOrganizacaoSchema) =>
      this.converterParaDominio(registro),
    );
  }

  public async salvarComVinculo(
    organizacao: Organizacao,
    vinculo: VinculoEmpregaticio,
  ): Promise<void> {
    const dadosOrganizacao =
      PrismaOrganizacaoMapper
        .paraPersistencia(organizacao);

    const dadosVinculo =
      PrismaVinculoEmpregaticioMapper
        .paraPersistencia(vinculo);

    try {
      await this.prisma.$transaction(
        async (transacao: Prisma.TransactionClient) => {
          await transacao.organizacao.create({
            data: dadosOrganizacao,
          });

          const vinculoCriado =
            await transacao.vinculoEmpregaticio
              .create({
                data: dadosVinculo,
              });

          // Mesmo registro de histórico que o PrismaVinculoEmpregaticioAdapter grava ao criar um vínculo
          await transacao
            .historicoVinculoEmpregaticio
            .create({
              data: {
                vinculoId: vinculoCriado.id,
                cargo: vinculoCriado.cargo,
                ativo: vinculoCriado.ativo,
              },
            });
        },
      );
    } catch (erro) {
      // Duas criações simultâneas podem passar pela checagem de slug do caso de uso;
      // o índice único do banco é a garantia final
      if (this.ehViolacaoDeUnicidade(erro)) {
        throw new OrganizacaoJaExistenteError(organizacao.slug.valor);
      }

      throw erro;
    }
  }

  // O pacote database só exporta os tipos do Prisma, então o erro é identificado pelo código
  private ehViolacaoDeUnicidade(
    erro: unknown,
  ): boolean {
    return typeof erro === "object"
      && erro !== null
      && (erro as { code?: unknown }).code === PRISMA_UNIQUE_CONSTRAINT;
  }

  private converterParaDominio(
    dadosPrisma: PrismaOrganizacaoSchema,
  ): Organizacao {
    const resultado =
      PrismaOrganizacaoMapper
        .paraDominio(dadosPrisma);

    if (resultado.isFalha) {
      throw resultado.falha;
    }

    return resultado.resultado;
  }
}
