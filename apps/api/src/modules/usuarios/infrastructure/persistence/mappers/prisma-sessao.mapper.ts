import type { Prisma } from "database";
import { Result } from "@saas/shared";
import { Sessao } from "@saas/usuarios";

export type PrismaSessaoSchema =
  Prisma.SessaoGetPayload<{}>;

export class PrismaSessaoMapper {
  public static paraDominio(
    dadosPrisma: PrismaSessaoSchema,
  ): Result<Sessao> {
    return Sessao.criar({
      sid: dadosPrisma.id,
      usuarioId: dadosPrisma.usuarioId,
      userAgent: dadosPrisma.userAgent,
      ipAddress: dadosPrisma.ipAddress,
      ativo: dadosPrisma.ativo,
      criadaEm: dadosPrisma.criadoEm,
      expiraEm: dadosPrisma.expiraEm,
    });
  }

  public static paraPersistencia(
    sessao: Sessao,
  ): Prisma.SessaoUncheckedCreateInput {
    return {
      id: sessao.sid.valor,
      usuarioId: sessao.usuarioId.valor,
      userAgent: sessao.userAgent,
      ipAddress: sessao.ipAddress.valor,
      ativo: sessao.ativo,
      criadoEm: sessao.criadaEm,
      expiraEm: sessao.expiraEm,
    };
  }
}