import { beforeEach, describe, expect, it, vi } from "vitest";

import { Id } from "@saas/shared";
import { Usuario } from "@saas/usuarios";

import type { PrismaService } from "src/modules/database/services/prisma.service";
import type { PrismaUsuarioSchema } from "@users/infrastructure/persistence/mappers/prisma-usuario.mapper";
import { PrismaUsuarioAdapter } from "@users/infrastructure/persistence/prisma/prisma-usuario.adapter";

describe("PrismaUsuarioAdapter", () => {
  function criarRegistroPrisma(
    alteracoes: Partial<PrismaUsuarioSchema> = {},
  ): PrismaUsuarioSchema {
    return {
      id: Id.criar().resultado.valor,
      nome: "Maria Silva",
      email: "maria@empresa.com",
      senhaHash: "$2b$10$hashedpassword",
      criadoEm: new Date(),
      ...alteracoes,
    };
  }

  let usuarioPrisma: { findMany: ReturnType<typeof vi.fn> };
  let repositorio: PrismaUsuarioAdapter;

  beforeEach(() => {
    usuarioPrisma = { findMany: vi.fn().mockResolvedValue([]) };
    repositorio = new PrismaUsuarioAdapter({ usuario: usuarioPrisma } as unknown as PrismaService);
  });

  describe("listarPorIds", () => {
    it("deve buscar todos os usuários dos ids informados em uma única consulta", async () => {
      const registros = [
        criarRegistroPrisma({ email: "ana@empresa.com", nome: "Ana Lima" }),
        criarRegistroPrisma({ email: "joao@empresa.com", nome: "Joao Souza" }),
      ];
      usuarioPrisma.findMany.mockResolvedValue(registros);

      const usuarios = await repositorio.listarPorIds(registros.map((registro) => Id.criar(registro.id).resultado));

      expect(usuarioPrisma.findMany).toHaveBeenCalledTimes(1);
      expect(usuarioPrisma.findMany).toHaveBeenCalledWith({
        where: { id: { in: registros.map((registro) => registro.id) } },
      });
      expect(usuarios).toHaveLength(2);
      expect(usuarios[0]).toBeInstanceOf(Usuario);
      expect(usuarios.map((usuario) => usuario.email.valor)).toEqual(["ana@empresa.com", "joao@empresa.com"]);
    });

    it("não deve consultar o banco quando a lista de ids estiver vazia", async () => {
      expect(await repositorio.listarPorIds([])).toEqual([]);
      expect(usuarioPrisma.findMany).not.toHaveBeenCalled();
    });

    it("deve lançar o erro de domínio quando um registro for inválido", async () => {
      usuarioPrisma.findMany.mockResolvedValue([criarRegistroPrisma({ email: "email-invalido" })]);

      await expect(repositorio.listarPorIds([Id.criar().resultado])).rejects.toThrow();
    });
  });
});
