import { beforeEach, describe, expect, it, vi } from "vitest";

import { Id, TipoCargo, VinculoEmpregaticio } from "@saas/shared";
import { Organizacao, OrganizacaoJaExistenteError, Slug } from "@saas/organizacoes";

import type { PrismaService } from "src/modules/database/services/prisma.service";
import type { PrismaOrganizacaoSchema } from "@organizacoes/infrastructure/persistence/mappers/prisma-organizacao.mapper";
import { PrismaOrganizacaoAdapter } from "@organizacoes/infrastructure/persistence/prisma/prisma-organizacao.adapter";

describe("PrismaOrganizacaoAdapter", () => {
  function criarRegistroPrisma(
    alteracoes: Partial<PrismaOrganizacaoSchema> = {},
  ): PrismaOrganizacaoSchema {
    return {
      id: Id.criar().resultado.valor,
      nome: "Empresa Teste",
      slug: "empresa-teste",
      criadoEm: new Date(),
      ...alteracoes,
    };
  }

  function criarOrganizacaoComVinculo(): [Organizacao, VinculoEmpregaticio] {
    const organizacao = Organizacao.criar({ nome: "Empresa Teste" }).resultado;
    const vinculo = VinculoEmpregaticio.criar({
      usuarioId: Id.criar().resultado.valor,
      organizacaoId: organizacao.id.valor,
      cargo: TipoCargo.PROPRIETARIO,
    }).resultado;
    return [organizacao, vinculo];
  }

  let organizacaoPrisma: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };

  let transacao: {
    organizacao: { create: ReturnType<typeof vi.fn> };
    vinculoEmpregaticio: { create: ReturnType<typeof vi.fn> };
    historicoVinculoEmpregaticio: { create: ReturnType<typeof vi.fn> };
  };

  let prisma: PrismaService;
  let repositorio: PrismaOrganizacaoAdapter;

  beforeEach(() => {
    organizacaoPrisma = {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    };

    transacao = {
      organizacao: { create: vi.fn() },
      vinculoEmpregaticio: {
        // Devolve o registro criado, como o Prisma faz
        create: vi.fn(async ({ data }) => ({ ...data, atualizadoEm: new Date() })),
      },
      historicoVinculoEmpregaticio: { create: vi.fn() },
    };

    prisma = {
      organizacao: organizacaoPrisma,
      $transaction: vi.fn(
        async (callback: (tx: typeof transacao) => Promise<unknown>) => callback(transacao),
      ),
    } as unknown as PrismaService;

    repositorio = new PrismaOrganizacaoAdapter(prisma);
  });

  describe("buscarPorId", () => {
    it("deve retornar a organização encontrada", async () => {
      const registro = criarRegistroPrisma();
      organizacaoPrisma.findUnique.mockResolvedValue(registro);

      const organizacao = await repositorio.buscarPorId(Id.criar(registro.id).resultado);

      expect(organizacaoPrisma.findUnique).toHaveBeenCalledWith({ where: { id: registro.id } });
      expect(organizacao).toBeInstanceOf(Organizacao);
      expect(organizacao?.id.valor).toBe(registro.id);
    });

    it("deve retornar null quando a organização não existir", async () => {
      expect(await repositorio.buscarPorId(Id.criar().resultado)).toBeNull();
    });

    it("deve lançar o erro de domínio quando o registro for inválido", async () => {
      organizacaoPrisma.findUnique.mockResolvedValue(criarRegistroPrisma({ nome: "A" }));

      await expect(repositorio.buscarPorId(Id.criar().resultado)).rejects.toThrow();
    });
  });

  describe("buscarPorSlug", () => {
    it("deve buscar pelo valor do slug", async () => {
      const registro = criarRegistroPrisma({ slug: "minha-empresa" });
      organizacaoPrisma.findUnique.mockResolvedValue(registro);

      const organizacao = await repositorio.buscarPorSlug(Slug.criar("minha-empresa").resultado);

      expect(organizacaoPrisma.findUnique).toHaveBeenCalledWith({ where: { slug: "minha-empresa" } });
      expect(organizacao?.slug.valor).toBe("minha-empresa");
    });

    it("deve retornar null quando o slug não existir", async () => {
      expect(await repositorio.buscarPorSlug(Slug.criar("inexistente").resultado)).toBeNull();
    });
  });

  describe("listarPorIds", () => {
    it("deve buscar todas as organizações dos ids informados", async () => {
      const registros = [criarRegistroPrisma({ nome: "Alfa Ltda" }), criarRegistroPrisma({ nome: "Beta Ltda" })];
      organizacaoPrisma.findMany.mockResolvedValue(registros);
      const ids = registros.map((registro) => Id.criar(registro.id).resultado);

      const organizacoes = await repositorio.listarPorIds(ids);

      expect(organizacaoPrisma.findMany).toHaveBeenCalledWith({
        where: { id: { in: registros.map((registro) => registro.id) } },
      });
      expect(organizacoes.map((organizacao) => organizacao.nome.valor)).toEqual(["Alfa Ltda", "Beta Ltda"]);
    });

    it("não deve consultar o banco quando a lista de ids estiver vazia", async () => {
      expect(await repositorio.listarPorIds([])).toEqual([]);
      expect(organizacaoPrisma.findMany).not.toHaveBeenCalled();
    });
  });

  describe("salvarComVinculo", () => {
    it("deve criar a organização, o vínculo e o histórico dentro de uma transação", async () => {
      const [organizacao, vinculo] = criarOrganizacaoComVinculo();

      await repositorio.salvarComVinculo(organizacao, vinculo);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(transacao.organizacao.create).toHaveBeenCalledWith({
        data: {
          id: organizacao.id.valor,
          nome: "Empresa Teste",
          slug: "empresa-teste",
          criadoEm: organizacao.criadoEm,
        },
      });
      expect(transacao.vinculoEmpregaticio.create).toHaveBeenCalledWith({
        data: {
          id: vinculo.id.valor,
          usuarioId: vinculo.usuarioId.valor,
          organizacaoId: organizacao.id.valor,
          cargo: "PROPRIETARIO",
          ativo: true,
          criadoEm: vinculo.criadoEm,
        },
      });
      expect(transacao.historicoVinculoEmpregaticio.create).toHaveBeenCalledWith({
        data: {
          vinculoId: vinculo.id.valor,
          cargo: "PROPRIETARIO",
          ativo: true,
        },
      });
    });

    it("deve criar a organização antes do vínculo, por causa da chave estrangeira", async () => {
      const [organizacao, vinculo] = criarOrganizacaoComVinculo();

      await repositorio.salvarComVinculo(organizacao, vinculo);

      const ordemOrganizacao = transacao.organizacao.create.mock.invocationCallOrder[0]!;
      const ordemVinculo = transacao.vinculoEmpregaticio.create.mock.invocationCallOrder[0]!;
      expect(ordemOrganizacao).toBeLessThan(ordemVinculo);
    });

    it("deve converter violação de unicidade (slug em uso) em OrganizacaoJaExistenteError", async () => {
      const [organizacao, vinculo] = criarOrganizacaoComVinculo();
      transacao.organizacao.create.mockRejectedValue(
        Object.assign(new Error("Unique constraint failed"), { code: "P2002" }),
      );

      await expect(repositorio.salvarComVinculo(organizacao, vinculo)).rejects.toBeInstanceOf(
        OrganizacaoJaExistenteError,
      );
      expect(transacao.vinculoEmpregaticio.create).not.toHaveBeenCalled();
    });

    it("deve propagar outros erros do banco sem alterá-los", async () => {
      const [organizacao, vinculo] = criarOrganizacaoComVinculo();
      const erroDeConexao = Object.assign(new Error("Connection lost"), { code: "P1001" });
      transacao.vinculoEmpregaticio.create.mockRejectedValue(erroDeConexao);

      await expect(repositorio.salvarComVinculo(organizacao, vinculo)).rejects.toBe(erroDeConexao);
    });
  });
});
