import type { Prisma } from "database";

import { VinculoEmpregaticio, TipoCargo, Result } from "@saas/shared";

export type PrismaVinculoEmpregaticioSchema =
  Prisma.VinculoEmpregaticioGetPayload<{}>;

type PrismaTipoCargo =
  Prisma.VinculoEmpregaticioUncheckedCreateInput["cargo"];


export class PrismaVinculoEmpregaticioMapper {
  public static paraDominio(
    dadosPrisma: PrismaVinculoEmpregaticioSchema,
  ): Result<VinculoEmpregaticio> {
    return VinculoEmpregaticio.criar({
      id: dadosPrisma.id,
      usuarioId: dadosPrisma.usuarioId,
      organizacaoId: dadosPrisma.organizacaoId,
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
      case "PROPRIETARIO":
        return TipoCargo.PROPRIETARIO;
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
      case TipoCargo.PROPRIETARIO:
        return "PROPRIETARIO";

      case TipoCargo.ADMINISTRADOR:
        return "ADMINISTRADOR";

      case TipoCargo.FUNCIONARIO:
        return "FUNCIONARIO";
      default:
        throw new Error(`Cargo inválido ou desconhecido: ${cargo}`);
    }
  }
}