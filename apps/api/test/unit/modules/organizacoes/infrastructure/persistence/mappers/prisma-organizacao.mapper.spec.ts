import { describe, expect, it } from "vitest";

import { Id } from "@saas/shared";
import { NomeDaOrganizacaoInvalidoError, Organizacao } from "@saas/organizacoes";

import {
  PrismaOrganizacaoMapper,
  type PrismaOrganizacaoSchema,
} from "@organizacoes/infrastructure/persistence/mappers/prisma-organizacao.mapper";

describe("PrismaOrganizacaoMapper", () => {
  function criarRegistroPrisma(
    alteracoes: Partial<PrismaOrganizacaoSchema> = {},
  ): PrismaOrganizacaoSchema {
    return {
      id: Id.criar().resultado.valor,
      nome: "Empresa Teste",
      slug: "empresa-teste",
      criadoEm: new Date("2026-01-15T10:00:00.000Z"),
      ...alteracoes,
    };
  }

  describe("paraDominio", () => {
    it("deve converter um registro Prisma para o domínio", () => {
      const dadosPrisma = criarRegistroPrisma();

      const resultado = PrismaOrganizacaoMapper.paraDominio(dadosPrisma);

      expect(resultado.isSucesso).toBe(true);

      const organizacao = resultado.resultado;
      expect(organizacao).toBeInstanceOf(Organizacao);
      expect(organizacao.id.valor).toBe(dadosPrisma.id);
      expect(organizacao.nome.valor).toBe("Empresa Teste");
      expect(organizacao.slug.valor).toBe("empresa-teste");
      expect(organizacao.criadoEm).toEqual(dadosPrisma.criadoEm);
    });

    it("deve retornar falha quando o registro tiver dados inválidos", () => {
      const resultado = PrismaOrganizacaoMapper.paraDominio(
        criarRegistroPrisma({ nome: "A" }),
      );

      expect(resultado.isFalha).toBe(true);
      expect(resultado.falha).toBeInstanceOf(NomeDaOrganizacaoInvalidoError);
    });
  });

  describe("paraPersistencia", () => {
    it("deve converter a organização para o formato do Prisma", () => {
      const organizacao = Organizacao.criar({
        nome: "Empresa Teste",
        slug: "Meu Slug",
      }).resultado;

      expect(PrismaOrganizacaoMapper.paraPersistencia(organizacao)).toEqual({
        id: organizacao.id.valor,
        nome: "Empresa Teste",
        slug: "meu-slug",
        criadoEm: organizacao.criadoEm,
      });
    });

    it("deve manter os dados após ida e volta pelo mapper", () => {
      const original = Organizacao.criar({ nome: "Empresa Teste" }).resultado;

      const persistido = PrismaOrganizacaoMapper.paraPersistencia(original);
      const recuperado = PrismaOrganizacaoMapper.paraDominio({
        id: persistido.id!,
        nome: persistido.nome,
        slug: persistido.slug,
        criadoEm: persistido.criadoEm as Date,
      }).resultado;

      expect(recuperado.id.equals(original.id)).toBe(true);
      expect(recuperado.nome.valor).toBe(original.nome.valor);
      expect(recuperado.slug.valor).toBe(original.slug.valor);
      expect(recuperado.criadoEm).toEqual(original.criadoEm);
    });
  });
});
