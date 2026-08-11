import type { Prisma } from "database";

import { VinculoEmpregaticio } from
  "@shared/domain/entities/vinculo-empregaticio.entidade";

import { TipoCargo } from
  "@shared/domain/enums/tipo-cargo.enum";

import { Id } from
  "@shared/domain/value-objects/id";

import { Result } from
  "@shared/domain/value-objects/result";


export type PrismaVinculoEmpregaticioSchema =
  Prisma.VinculoEmpregaticioGetPayload<{}>;

type PrismaTipoCargo =
  Prisma.VinculoEmpregaticioUncheckedCreateInput["cargo"];


export class PrismaVinculoEmpregaticioMapper {
  public static paraDominio(
    dadosPrisma: PrismaVinculoEmpregaticioSchema,
  ): Result<VinculoEmpregaticio> {
    const id = Id.criar(dadosPrisma.id);

    if (id.isFalha) {
      return Result.falhar(id.falha);
    }

    const usuarioId = Id.criar(
      dadosPrisma.usuarioId,
    );

    if (usuarioId.isFalha) {
      return Result.falhar(
        usuarioId.falha,
      );
    }

    const organizacaoId = Id.criar(
      dadosPrisma.organizacaoId,
    );

    if (organizacaoId.isFalha) {
      return Result.falhar(
        organizacaoId.falha,
      );
    }

    return VinculoEmpregaticio.criar({
      id: id.resultado,
      usuarioId: usuarioId.resultado,
      organizacaoId:
        organizacaoId.resultado,
      cargo: this.cargoParaDominio(
        dadosPrisma.cargo,
      ),
      ativo: dadosPrisma.ativo,
    });
  }


  public static paraPersistencia(
    vinculo: VinculoEmpregaticio,
  ): Prisma.VinculoEmpregaticioUncheckedCreateInput {
    return {
      id: vinculo.id.valor,

      usuarioId:
        vinculo.usuarioId.valor,

      organizacaoId:
        vinculo.organizacaoId.valor,

      cargo: this.cargoParaPersistencia(
        vinculo.cargo,
      ),

      ativo: vinculo.estaAtivo,
    };
  }


  private static cargoParaDominio(
    cargo: PrismaTipoCargo,
  ): TipoCargo {
    switch (cargo) {
      case "ADMINISTRADOR":
        return TipoCargo.ADMINISTRADOR;

      case "FUNCIONARIO":
        return TipoCargo.FUNCIONARIO;

      default:
        throw new Error(`Cargo do banco inválido ou desconhecido: ${cargo}`);
    }
  }


  private static cargoParaPersistencia(
    cargo: TipoCargo,
  ): PrismaTipoCargo {
    switch (cargo) {
      case TipoCargo.ADMINISTRADOR:
        return "ADMINISTRADOR";

      case TipoCargo.FUNCIONARIO:
        return "FUNCIONARIO";
      default:
        throw new Error(`Cargo inválido ou desconhecido: ${cargo}`);
    }
  }
}