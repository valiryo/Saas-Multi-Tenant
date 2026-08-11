import type { PrismaClient } from "database";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { VinculoEmpregaticio } from "@shared/domain/entities/vinculo-empregaticio.entidade";
import { TipoCargo } from "@shared/domain/enums/tipo-cargo.enum";
import { Id } from "@shared/domain/value-objects/id";

import type {
  PrismaVinculoEmpregaticioSchema,
} from "@shared/infrastructure/persistence/mappers/prisma-vinculo-empregaticio.mapper";

import { PrismaVinculoEmpregaticioAdapter } from "@shared/infrastructure/persistence/prisma/prisma-vinculo-empregaticio.adapter";

describe("PrismaVinculoEmpregaticioRepositorio", () => {
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
    const resultado = VinculoEmpregaticio.criar({
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

  let prisma: PrismaClient;

  let vinculoPrisma: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };

  let vinculoTransacao: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  let historicoTransacao: {
    create: ReturnType<typeof vi.fn>;
  };

  let repositorio:
    PrismaVinculoEmpregaticioAdapter;

  beforeEach(() => {
    vinculoPrisma = {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    };

    vinculoTransacao = {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    historicoTransacao = {
      create: vi.fn(),
    };

    const transacao = {
      vinculoEmpregaticio:
        vinculoTransacao,

      historicoVinculoEmpregaticio:
        historicoTransacao,
    };

    prisma = {
      vinculoEmpregaticio:
        vinculoPrisma,

      $transaction: vi.fn(
        async (
          callback: (
            tx: typeof transacao,
          ) => Promise<unknown>,
        ) => callback(transacao),
      ),
    } as unknown as PrismaClient;

    repositorio =
      new PrismaVinculoEmpregaticioAdapter(
        prisma,
      );
  });

  describe("buscarPorId", () => {
    it("deve retornar o vínculo encontrado", async () => {
      const registro =
        criarRegistroPrisma();

      vinculoPrisma.findUnique
        .mockResolvedValue(registro);

      const id =
        Id.criar(registro.id).resultado;

      const resultado =
        await repositorio.buscarPorId(id);

      expect(
        vinculoPrisma.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: registro.id,
        },
      });

      expect(resultado).not.toBeNull();

      expect(resultado?.id.valor).toBe(
        registro.id,
      );
    });

    it("deve retornar null quando o vínculo não existir", async () => {
      vinculoPrisma.findUnique
        .mockResolvedValue(null);

      const resultado =
        await repositorio.buscarPorId(
          Id.criar().resultado,
        );

      expect(resultado).toBeNull();
    });
  });

  describe("buscarPorUsuarioEOrganizacao", () => {
    it("deve buscar usando a chave composta", async () => {
      const registro =
        criarRegistroPrisma();

      vinculoPrisma.findUnique
        .mockResolvedValue(registro);

      const usuarioId =
        Id.criar(
          registro.usuarioId,
        ).resultado;

      const organizacaoId =
        Id.criar(
          registro.organizacaoId,
        ).resultado;

      const resultado =
        await repositorio
          .buscarPorUsuarioEOrganizacao(
            usuarioId,
            organizacaoId,
          );

      expect(
        vinculoPrisma.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          usuarioId_organizacaoId: {
            usuarioId:
              registro.usuarioId,

            organizacaoId:
              registro.organizacaoId,
          },
        },
      });

      expect(resultado).not.toBeNull();
    });

    it("deve retornar null quando não houver vínculo", async () => {
      vinculoPrisma.findUnique
        .mockResolvedValue(null);

      const resultado =
        await repositorio
          .buscarPorUsuarioEOrganizacao(
            Id.criar().resultado,
            Id.criar().resultado,
          );

      expect(resultado).toBeNull();
    });
  });

  describe("buscarAtivoPorUsuarioEOrganizacao", () => {
    it("deve filtrar somente vínculo ativo", async () => {
      const registro =
        criarRegistroPrisma({
          ativo: true,
        });

      vinculoPrisma.findFirst
        .mockResolvedValue(registro);

      const usuarioId =
        Id.criar(
          registro.usuarioId,
        ).resultado;

      const organizacaoId =
        Id.criar(
          registro.organizacaoId,
        ).resultado;

      await repositorio
        .buscarAtivoPorUsuarioEOrganizacao(
          usuarioId,
          organizacaoId,
        );

      expect(
        vinculoPrisma.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          usuarioId:
            registro.usuarioId,

          organizacaoId:
            registro.organizacaoId,

          ativo: true,
        },
      });
    });

    it("deve retornar null quando não existir vínculo ativo", async () => {
      vinculoPrisma.findFirst
        .mockResolvedValue(null);

      const resultado =
        await repositorio
          .buscarAtivoPorUsuarioEOrganizacao(
            Id.criar().resultado,
            Id.criar().resultado,
          );

      expect(resultado).toBeNull();
    });
  });

  describe("listagens", () => {
    it("deve listar todos os vínculos do usuário", async () => {
      const usuarioId =
        Id.criar().resultado;

      vinculoPrisma.findMany
        .mockResolvedValue([]);

      await repositorio
        .listarPorUsuario(usuarioId);

      expect(
        vinculoPrisma.findMany,
      ).toHaveBeenCalledWith({
        where: {
          usuarioId:
            usuarioId.valor,
        },

        orderBy: {
          criadoEm: "asc",
        },
      });
    });

    it("deve listar somente vínculos ativos do usuário", async () => {
      const usuarioId =
        Id.criar().resultado;

      vinculoPrisma.findMany
        .mockResolvedValue([]);

      await repositorio
        .listarAtivosPorUsuario(
          usuarioId,
        );

      expect(
        vinculoPrisma.findMany,
      ).toHaveBeenCalledWith({
        where: {
          usuarioId:
            usuarioId.valor,

          ativo: true,
        },

        orderBy: {
          criadoEm: "asc",
        },
      });
    });

    it("deve listar todos os vínculos da organização", async () => {
      const organizacaoId =
        Id.criar().resultado;

      vinculoPrisma.findMany
        .mockResolvedValue([]);

      await repositorio
        .listarPorOrganizacao(
          organizacaoId,
        );

      expect(
        vinculoPrisma.findMany,
      ).toHaveBeenCalledWith({
        where: {
          organizacaoId:
            organizacaoId.valor,
        },

        orderBy: {
          criadoEm: "asc",
        },
      });
    });

    it("deve listar somente vínculos ativos da organização", async () => {
      const organizacaoId =
        Id.criar().resultado;

      vinculoPrisma.findMany
        .mockResolvedValue([]);

      await repositorio
        .listarAtivosPorOrganizacao(
          organizacaoId,
        );

      expect(
        vinculoPrisma.findMany,
      ).toHaveBeenCalledWith({
        where: {
          organizacaoId:
            organizacaoId.valor,

          ativo: true,
        },

        orderBy: {
          criadoEm: "asc",
        },
      });
    });

    it("deve converter os registros encontrados para o domínio", async () => {
      const usuarioId =
        Id.criar().resultado;

      const primeiro =
        criarRegistroPrisma({
          usuarioId:
            usuarioId.valor,
        });

      const segundo =
        criarRegistroPrisma({
          usuarioId:
            usuarioId.valor,

          cargo:
            "ADMINISTRADOR",

          ativo: false,
        });

      vinculoPrisma.findMany
        .mockResolvedValue([
          primeiro,
          segundo,
        ]);

      const resultado =
        await repositorio
          .listarPorUsuario(usuarioId);

      expect(resultado).toHaveLength(2);

      expect(
        resultado[0]?.cargo,
      ).toBe(
        TipoCargo.FUNCIONARIO,
      );

      expect(
        resultado[1]?.cargo,
      ).toBe(
        TipoCargo.ADMINISTRADOR,
      );

      expect(
        resultado[1]?.estaAtivo,
      ).toBe(false);
    });
  });

  describe("salvar", () => {
    it("deve criar um novo vínculo e registrar o estado inicial no histórico", async () => {
      const vinculo =
        criarVinculo();

      const registroCriado =
        criarRegistroPrisma({
          id:
            vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,

          cargo:
            "FUNCIONARIO",

          ativo: true,
        });

      vinculoTransacao.findUnique
        .mockResolvedValue(null);

      vinculoTransacao.create
        .mockResolvedValue(
          registroCriado,
        );

      historicoTransacao.create
        .mockResolvedValue({
          id:
            Id.criar()
              .resultado
              .valor,

          vinculoId:
            registroCriado.id,

          cargo:
            registroCriado.cargo,

          ativo:
            registroCriado.ativo,

          alteradoEm:
            new Date(),
        });

      const resultado =
        await repositorio.salvar(
          vinculo,
        );

      expect(
        vinculoTransacao.create,
      ).toHaveBeenCalledWith({
        data: {
          id:
            vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,

          cargo:
            "FUNCIONARIO",

          ativo: true,
        },
      });

      expect(
        historicoTransacao.create,
      ).toHaveBeenCalledWith({
        data: {
          vinculoId:
            registroCriado.id,

          cargo:
            "FUNCIONARIO",

          ativo: true,
        },
      });

      expect(
        resultado.id.valor,
      ).toBe(
        vinculo.id.valor,
      );
    });

    it("não deve atualizar nem criar histórico quando nada tiver mudado", async () => {
      const vinculo =
        criarVinculo({
          cargo:
            TipoCargo.FUNCIONARIO,

          ativo: true,
        });

      const registroAtual =
        criarRegistroPrisma({
          id:
            vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,

          cargo:
            "FUNCIONARIO",

          ativo: true,
        });

      vinculoTransacao.findUnique
        .mockResolvedValue(
          registroAtual,
        );

      await repositorio.salvar(
        vinculo,
      );

      expect(
        vinculoTransacao.update,
      ).not.toHaveBeenCalled();

      expect(
        historicoTransacao.create,
      ).not.toHaveBeenCalled();
    });

    it("deve atualizar o cargo e registrar o novo estado no histórico", async () => {
      const vinculo =
        criarVinculo({
          cargo:
            TipoCargo.ADMINISTRADOR,

          ativo: true,
        });

      const registroAtual =
        criarRegistroPrisma({
          id:
            vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,

          cargo:
            "FUNCIONARIO",

          ativo: true,
        });

      const registroAtualizado:
        PrismaVinculoEmpregaticioSchema = {
          ...registroAtual,
          cargo:
            "ADMINISTRADOR",
        };

      vinculoTransacao.findUnique
        .mockResolvedValue(
          registroAtual,
        );

      vinculoTransacao.update
        .mockResolvedValue(
          registroAtualizado,
        );

      historicoTransacao.create
        .mockResolvedValue({
          id:
            Id.criar()
              .resultado
              .valor,

          vinculoId:
            registroAtualizado.id,

          cargo:
            registroAtualizado.cargo,

          ativo:
            registroAtualizado.ativo,

          alteradoEm:
            new Date(),
        });

      await repositorio.salvar(
        vinculo,
      );

      expect(
        vinculoTransacao.update,
      ).toHaveBeenCalledWith({
        where: {
          id:
            registroAtual.id,
        },

        data: {
          cargo:
            "ADMINISTRADOR",

          ativo: true,
        },
      });

      expect(
        historicoTransacao.create,
      ).toHaveBeenCalledWith({
        data: {
          vinculoId:
            registroAtualizado.id,

          cargo:
            "ADMINISTRADOR",

          ativo: true,
        },
      });
    });

    it("deve desativar o vínculo e registrar o novo estado no histórico", async () => {
      const vinculo =
        criarVinculo({
          ativo: false,
        });

      const registroAtual =
        criarRegistroPrisma({
          id:
            vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,

          ativo: true,
        });

      const registroAtualizado:
        PrismaVinculoEmpregaticioSchema = {
          ...registroAtual,
          ativo: false,
        };

      vinculoTransacao.findUnique
        .mockResolvedValue(
          registroAtual,
        );

      vinculoTransacao.update
        .mockResolvedValue(
          registroAtualizado,
        );

      historicoTransacao.create
        .mockResolvedValue({
          id:
            Id.criar()
              .resultado
              .valor,

          vinculoId:
            registroAtualizado.id,

          cargo:
            registroAtualizado.cargo,

          ativo: false,

          alteradoEm:
            new Date(),
        });

      await repositorio.salvar(
        vinculo,
      );

      expect(
        vinculoTransacao.update,
      ).toHaveBeenCalledWith({
        where: {
          id:
            registroAtual.id,
        },

        data: {
          cargo:
            "FUNCIONARIO",

          ativo: false,
        },
      });

      expect(
        historicoTransacao.create,
      ).toHaveBeenCalledWith({
        data: {
          vinculoId:
            registroAtualizado.id,

          cargo:
            "FUNCIONARIO",

          ativo: false,
        },
      });
    });

    it("deve reativar o vínculo e registrar o novo estado no histórico", async () => {
      const vinculo =
        criarVinculo({
          ativo: true,
        });

      const registroAtual =
        criarRegistroPrisma({
          id:
            vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,

          ativo: false,
        });

      const registroAtualizado:
        PrismaVinculoEmpregaticioSchema = {
          ...registroAtual,
          ativo: true,
        };

      vinculoTransacao.findUnique
        .mockResolvedValue(
          registroAtual,
        );

      vinculoTransacao.update
        .mockResolvedValue(
          registroAtualizado,
        );

      historicoTransacao.create
        .mockResolvedValue({
          id:
            Id.criar()
              .resultado
              .valor,

          vinculoId:
            registroAtualizado.id,

          cargo:
            registroAtualizado.cargo,

          ativo: true,

          alteradoEm:
            new Date(),
        });

      await repositorio.salvar(
        vinculo,
      );

      expect(
        vinculoTransacao.update,
      ).toHaveBeenCalledWith({
        where: {
          id:
            registroAtual.id,
        },

        data: {
          cargo:
            "FUNCIONARIO",

          ativo: true,
        },
      });

      expect(
        historicoTransacao.create,
      ).toHaveBeenCalledWith({
        data: {
          vinculoId:
            registroAtualizado.id,

          cargo:
            "FUNCIONARIO",

          ativo: true,
        },
      });
    });

    it("deve propagar o erro quando o registro do histórico falhar", async () => {
      const vinculo =
        criarVinculo();

      const registroCriado =
        criarRegistroPrisma({
          id:
            vinculo.id.valor,

          usuarioId:
            vinculo.usuarioId.valor,

          organizacaoId:
            vinculo.organizacaoId.valor,
        });

      vinculoTransacao.findUnique
        .mockResolvedValue(null);

      vinculoTransacao.create
        .mockResolvedValue(
          registroCriado,
        );

      historicoTransacao.create
        .mockRejectedValue(
          new Error(
            "Falha ao registrar histórico",
          ),
        );

      await expect(
        repositorio.salvar(vinculo),
      ).rejects.toThrow(
        "Falha ao registrar histórico",
      );
    });
  });
});