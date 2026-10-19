import { Injectable } from "@nestjs/common";
import type { Prisma } from "database";

import {
  VinculoEmpregaticio,
  IRepositorioVinculoEmpregaticio,
  Id,
  Result,
} from "@saas/shared";

import { PrismaService } from "src/modules/database/services/prisma.service";

import {
  PrismaVinculoEmpregaticioMapper,
  type PrismaVinculoEmpregaticioSchema,
} from "../mappers/prisma-vinculo-empregaticio.mapper";

@Injectable()
export class PrismaVinculoEmpregaticioAdapter
  implements IRepositorioVinculoEmpregaticio
{
  public constructor(
    private readonly prisma: PrismaService,
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
    const dadosPrisma =
      await this.prisma.$transaction(
        (transacao: Prisma.TransactionClient) =>
          this.gravar(transacao, vinculo),
      );

    return this.converterParaDominio(dadosPrisma);
  }

  public async alterarComTravaDaOrganizacao(
    organizacaoId: Id,
    alterar: (vinculosAtivos: VinculoEmpregaticio[]) => Result<VinculoEmpregaticio>,
  ): Promise<Result<VinculoEmpregaticio>> {
    return this.prisma.$transaction(
      async (transacao: Prisma.TransactionClient) => {
        // Trava a linha da organização até o fim da transação: outra alteração de membros da mesma
        // organização espera aqui, então a regra é checada sobre um estado que ninguém muda no meio.
        // NO KEY UPDATE não bloqueia a criação de vínculos (a FK só pede KEY SHARE).
        await transacao.$queryRaw`SELECT id FROM "Organizacao" WHERE id = ${organizacaoId.valor} FOR NO KEY UPDATE`;

        const registros =
          await transacao.vinculoEmpregaticio.findMany({
            where: {
              organizacaoId: organizacaoId.valor,
              ativo: true,
            },

            orderBy: {
              criadoEm: "asc",
            },
          });

        const alteracao = alterar(
          registros.map((registro: PrismaVinculoEmpregaticioSchema) =>
            this.converterParaDominio(registro),
          ),
        );

        if (alteracao.isFalha) {
          return Result.falhar(alteracao.falha);
        }

        const dadosPrisma =
          await this.gravar(transacao, alteracao.resultado);

        return Result.passar(this.converterParaDominio(dadosPrisma));
      },
    );
  }

  // Cria ou atualiza o vínculo e registra o novo estado no histórico, dentro da transação recebida
  private async gravar(
    transacao: Prisma.TransactionClient,
    vinculo: VinculoEmpregaticio,
  ): Promise<PrismaVinculoEmpregaticioSchema> {
    const dadosPersistencia =
      PrismaVinculoEmpregaticioMapper
        .paraPersistencia(vinculo);

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