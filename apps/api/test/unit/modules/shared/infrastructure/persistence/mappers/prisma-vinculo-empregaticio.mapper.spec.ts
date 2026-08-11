import { describe, expect, it } from "vitest";

import { VinculoEmpregaticio } from "@shared/domain/entities/vinculo-empregaticio.entidade";
import { TipoCargo } from "@shared/domain/enums/tipo-cargo.enum";
import { Id } from "@shared/domain/value-objects/id";

import {
  PrismaVinculoEmpregaticioMapper,
  type PrismaVinculoEmpregaticioSchema,
} from "@shared/infrastructure/persistence/mappers/prisma-vinculo-empregaticio.mapper";

describe("PrismaVinculoEmpregaticioMapper", () => {
  function criarRegistroPrisma(
    alteracoes: Partial<PrismaVinculoEmpregaticioSchema> = {},
  ): PrismaVinculoEmpregaticioSchema {
    const agora = new Date();

    return {
      id: Id.criar().resultado.valor,
      usuarioId: Id.criar().resultado.valor,
      organizacaoId: Id.criar().resultado.valor,
      cargo: "FUNCIONARIO",
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora,
      ...alteracoes,
    };
  }

  function criarVinculo(
    alteracoes: Partial<{
      id: Id;
      usuarioId: Id;
      organizacaoId: Id;
      cargo: TipoCargo;
      ativo: boolean;
    }> = {},
  ): VinculoEmpregaticio {
    const resultado =
      VinculoEmpregaticio.criar({
        id: alteracoes.id,
        usuarioId:
          alteracoes.usuarioId ??
          Id.criar().resultado,
        organizacaoId:
          alteracoes.organizacaoId ??
          Id.criar().resultado,
        cargo:
          alteracoes.cargo ??
          TipoCargo.FUNCIONARIO,
        ativo: alteracoes.ativo,
      });

    if (resultado.isFalha) {
      throw resultado.falha;
    }

    return resultado.resultado;
  }

  describe("paraDominio", () => {
    it("deve converter um registro Prisma para o domínio", () => {
      const dadosPrisma =
        criarRegistroPrisma();

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraDominio(dadosPrisma);

      expect(resultado.isFalha).toBe(false);

      if (resultado.isFalha) {
        throw resultado.falha;
      }

      const vinculo = resultado.resultado;

      expect(vinculo.id).toBeInstanceOf(Id);

      expect(
        vinculo.usuarioId,
      ).toBeInstanceOf(Id);

      expect(
        vinculo.organizacaoId,
      ).toBeInstanceOf(Id);

      expect(vinculo.id.valor).toBe(
        dadosPrisma.id,
      );

      expect(vinculo.usuarioId.valor).toBe(
        dadosPrisma.usuarioId,
      );

      expect(
        vinculo.organizacaoId.valor,
      ).toBe(
        dadosPrisma.organizacaoId,
      );

      expect(vinculo.cargo).toBe(
        TipoCargo.FUNCIONARIO,
      );

      expect(vinculo.estaAtivo).toBe(true);
    });

    it("deve converter o cargo administrador", () => {
      const dadosPrisma =
        criarRegistroPrisma({
          cargo: "ADMINISTRADOR",
        });

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraDominio(dadosPrisma);

      if (resultado.isFalha) {
        throw resultado.falha;
      }

      expect(
        resultado.resultado.cargo,
      ).toBe(
        TipoCargo.ADMINISTRADOR,
      );
    });

    it("deve reconstruir um vínculo inativo", () => {
      const dadosPrisma =
        criarRegistroPrisma({
          ativo: false,
        });

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraDominio(dadosPrisma);

      if (resultado.isFalha) {
        throw resultado.falha;
      }

      expect(
        resultado.resultado.estaAtivo,
      ).toBe(false);
    });

    it("deve falhar quando o ID do vínculo estiver inválido", () => {
      const dadosPrisma =
        criarRegistroPrisma({
          id: "id-invalido",
        });

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraDominio(dadosPrisma);

      expect(resultado.isFalha).toBe(true);
    });

    it("deve falhar quando o ID do usuário estiver inválido", () => {
      const dadosPrisma =
        criarRegistroPrisma({
          usuarioId: "usuario-invalido",
        });

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraDominio(dadosPrisma);

      expect(resultado.isFalha).toBe(true);
    });

    it("deve falhar quando o ID da organização estiver inválido", () => {
      const dadosPrisma =
        criarRegistroPrisma({
          organizacaoId:
            "organizacao-invalida",
        });

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraDominio(dadosPrisma);

      expect(resultado.isFalha).toBe(true);
    });
  });

  describe("paraPersistencia", () => {
    it.each([
      [
        TipoCargo.FUNCIONARIO,
        "FUNCIONARIO",
      ],
      [
        TipoCargo.ADMINISTRADOR,
        "ADMINISTRADOR",
      ],
    ] as const)(
      "deve converter o cargo %s para o Prisma",
      (cargoDominio, cargoPrisma) => {
        const vinculo = criarVinculo({
          cargo: cargoDominio,
        });

        const resultado =
          PrismaVinculoEmpregaticioMapper
            .paraPersistencia(vinculo);

        expect(resultado).toEqual({
          id: vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,

          cargo: cargoPrisma,

          ativo: true,
        });
      },
    );

    it("deve converter os IDs para strings na persistência", () => {
      const id = Id.criar().resultado;
      const usuarioId = Id.criar().resultado;
      const organizacaoId = Id.criar().resultado;

      const vinculo = criarVinculo({
        id,
        usuarioId,
        organizacaoId,
      });

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraPersistencia(vinculo);

      expect(resultado.id).toBe(
        id.valor,
      );

      expect(resultado.usuarioId).toBe(
        usuarioId.valor,
      );

      expect(
        resultado.organizacaoId,
      ).toBe(
        organizacaoId.valor,
      );
    });

    it("deve converter um vínculo inativo para persistência", () => {
      const vinculo = criarVinculo({
        ativo: false,
      });

      const resultado =
        PrismaVinculoEmpregaticioMapper
          .paraPersistencia(vinculo);

      expect(resultado.ativo).toBe(false);
    });
  });
});