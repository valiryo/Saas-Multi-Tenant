import type { Prisma } from "database";

import { Result } from "@saas/shared";

import { Organizacao } from "@saas/organizacoes";

export type PrismaOrganizacaoSchema =
  Prisma.OrganizacaoGetPayload<{}>;

export class PrismaOrganizacaoMapper {
  public static paraDominio(
    dadosPrisma: PrismaOrganizacaoSchema,
  ): Result<Organizacao> {
    return Organizacao.criar({
      id: dadosPrisma.id,
      nome: dadosPrisma.nome,
      slug: dadosPrisma.slug,
      criadoEm: dadosPrisma.criadoEm,
    });
  }

  public static paraPersistencia(
    organizacao: Organizacao,
  ): Prisma.OrganizacaoUncheckedCreateInput {
    return {
      id: organizacao.id.valor,
      nome: organizacao.nome.valor,
      slug: organizacao.slug.valor,
      criadoEm: organizacao.criadoEm,
    };
  }
}
