import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { GUARDS_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { Reflector } from "@nestjs/core";
import type { CommandBus, QueryBus } from "@nestjs/cqrs";

import { Result, TipoCargo, type VinculoEmpregaticioPublico } from "@saas/shared";
import { PermissaoInsuficienteError } from "@saas/organizacoes";
import type { TokenPayload } from "@saas/usuarios";

import { OrganizacoesController } from "@organizacoes/organizacoes.controller";
import { CARGOS_PERMITIDOS_KEY, CargoGuard, PARAMETRO_ORGANIZACAO } from "src/modules/auth/infrastructure/guards/cargo.guard";
import { CriarOrganizacaoCommand } from "@organizacoes/infrastructure/cqrs/criar-organizacao.command";
import { AdicionarMembroCommand } from "@organizacoes/infrastructure/cqrs/adicionar-membro.command";
import { AlterarCargoDoMembroCommand } from "@organizacoes/infrastructure/cqrs/alterar-cargo-do-membro.command";
import { RemoverMembroCommand } from "@organizacoes/infrastructure/cqrs/remover-membro.command";
import { ListarMembrosDaOrganizacaoQuery } from "@organizacoes/infrastructure/cqrs/listar-membros-da-organizacao.query";
import { ListarMinhasOrganizacoesQuery } from "@organizacoes/infrastructure/cqrs/listar-minhas-organizacoes.query";

describe("OrganizacoesController", () => {
  const ORGANIZACAO_ID = "org-id";
  const MEMBRO_ID = "membro-id";
  const usuario: TokenPayload = { sid: "sid", sub: "usuario-id", email: "dono@empresa.com", vinculoProps: [] };
  // Vínculos como o CargoGuard os deixa na request (@VinculoAtual)
  const vinculoProprietario: VinculoEmpregaticioPublico = { organizacaoId: ORGANIZACAO_ID, tipoCargo: TipoCargo.PROPRIETARIO };
  const vinculoAdministrador: VinculoEmpregaticioPublico = { organizacaoId: ORGANIZACAO_ID, tipoCargo: TipoCargo.ADMINISTRADOR };

  let commandBus: { execute: ReturnType<typeof vi.fn> };
  let queryBus: { execute: ReturnType<typeof vi.fn> };
  let controller: OrganizacoesController;

  beforeEach(() => {
    commandBus = { execute: vi.fn().mockResolvedValue(Result.passar({ ok: true })) };
    queryBus = { execute: vi.fn().mockResolvedValue(Result.passar([])) };
    controller = new OrganizacoesController(
      commandBus as unknown as CommandBus,
      queryBus as unknown as QueryBus,
    );
  });

  describe("proteção por cargo", () => {
    const reflector = new Reflector();
    const rotas = OrganizacoesController.prototype;

    it.each([
      ["adicionarMembro", [TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR]],
      ["alterarCargoDoMembro", [TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR]],
      ["removerMembro", [TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR]],
      ["listarMembros", [TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR]],
    ] as const)("%s deve exigir os cargos %j por meio do CargoGuard", (rota, cargos) => {
      const handler = rotas[rota];

      expect(reflector.get(CARGOS_PERMITIDOS_KEY, handler)).toEqual(cargos);
      expect(reflector.get(GUARDS_METADATA, handler)).toContain(CargoGuard);
    });

    it.each(["criar", "listarMinhas"] as const)(
      "%s não deve exigir cargo, pois não atua sobre uma organização existente",
      (rota) => {
        expect(reflector.get(CARGOS_PERMITIDOS_KEY, rotas[rota])).toBeUndefined();
        expect(reflector.get(GUARDS_METADATA, rotas[rota])).toBeUndefined();
      },
    );

    it.each(["listarMembros", "adicionarMembro", "alterarCargoDoMembro", "removerMembro"] as const)(
      "%s deve declarar o parâmetro de rota lido pelo CargoGuard",
      (rota) => {
        expect(reflector.get(PATH_METADATA, rotas[rota])).toContain(`:${PARAMETRO_ORGANIZACAO}`);
      },
    );
  });

  describe("criar", () => {
    it("deve enviar o comando com o usuário autenticado como criador e devolver o resultado", async () => {
      const resposta = await controller.criar({ nome: "Empresa Teste", slug: "empresa" }, usuario);

      expect(commandBus.execute).toHaveBeenCalledWith(new CriarOrganizacaoCommand("Empresa Teste", "usuario-id", "empresa"));
      expect(resposta).toEqual({ ok: true });
    });

    it("deve aceitar a criação sem slug", async () => {
      await controller.criar({ nome: "Empresa Teste" }, usuario);

      expect(commandBus.execute).toHaveBeenCalledWith(new CriarOrganizacaoCommand("Empresa Teste", "usuario-id", undefined));
    });

    it.each([undefined, {}, { nome: "" }, { nome: "   " }, { nome: 123 }])(
      "deve lançar BadRequestException quando o nome não for informado (%j)",
      async (body) => {
        await expect(controller.criar(body, usuario)).rejects.toBeInstanceOf(BadRequestException);
        expect(commandBus.execute).not.toHaveBeenCalled();
      },
    );

    it("deve lançar BadRequestException quando o slug não for texto", async () => {
      await expect(controller.criar({ nome: "Empresa", slug: 42 }, usuario)).rejects.toBeInstanceOf(BadRequestException);
    });

    it("deve lançar o erro de domínio quando o comando falhar", async () => {
      const erro = new PermissaoInsuficienteError();
      commandBus.execute.mockResolvedValue(Result.falhar(erro));

      await expect(controller.criar({ nome: "Empresa" }, usuario)).rejects.toBe(erro);
    });
  });

  describe("listarMinhas", () => {
    it("deve consultar as organizações do usuário autenticado", async () => {
      const organizacoes = [{ id: ORGANIZACAO_ID }];
      queryBus.execute.mockResolvedValue(Result.passar(organizacoes));

      const resposta = await controller.listarMinhas(usuario);

      expect(queryBus.execute).toHaveBeenCalledWith(new ListarMinhasOrganizacoesQuery("usuario-id"));
      expect(resposta).toBe(organizacoes);
    });
  });

  describe("listarMembros", () => {
    it("deve consultar os membros da organização em nome do usuário autenticado", async () => {
      await controller.listarMembros(ORGANIZACAO_ID);

      expect(queryBus.execute).toHaveBeenCalledWith(new ListarMembrosDaOrganizacaoQuery(ORGANIZACAO_ID));
    });

    it("deve lançar o erro de domínio quando a consulta falhar", async () => {
      const erro = new PermissaoInsuficienteError();
      queryBus.execute.mockResolvedValue(Result.falhar(erro));

      await expect(controller.listarMembros(ORGANIZACAO_ID)).rejects.toBe(erro);
    });
  });

  describe("adicionarMembro", () => {
    it("deve enviar o comando com o e-mail sem espaços e o cargo informado", async () => {
      await controller.adicionarMembro(ORGANIZACAO_ID, { email: " membro@empresa.com ", cargo: "ADMINISTRADOR" });

      expect(commandBus.execute).toHaveBeenCalledWith(
        new AdicionarMembroCommand(ORGANIZACAO_ID, "membro@empresa.com", TipoCargo.ADMINISTRADOR),
      );
    });

    it.each([undefined, {}, { email: "", cargo: "FUNCIONARIO" }, { email: 1, cargo: "FUNCIONARIO" }])(
      "deve lançar BadRequestException quando o e-mail não for informado (%j)",
      async (body) => {
        await expect(controller.adicionarMembro(ORGANIZACAO_ID, body)).rejects.toBeInstanceOf(BadRequestException);
        expect(commandBus.execute).not.toHaveBeenCalled();
      },
    );

    it.each([undefined, "", "GERENTE", "funcionario"])(
      "deve lançar BadRequestException quando o cargo for inválido (%j)",
      async (cargo) => {
        await expect(
          controller.adicionarMembro(ORGANIZACAO_ID, { email: "membro@empresa.com", cargo }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(commandBus.execute).not.toHaveBeenCalled();
      },
    );
  });

  describe("alterarCargoDoMembro", () => {
    it("deve enviar o comando com o cargo verificado pelo guard, o membro da rota e o novo cargo", async () => {
      await controller.alterarCargoDoMembro(ORGANIZACAO_ID, MEMBRO_ID, { cargo: "PROPRIETARIO" }, vinculoProprietario);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new AlterarCargoDoMembroCommand(TipoCargo.PROPRIETARIO, ORGANIZACAO_ID, MEMBRO_ID, TipoCargo.PROPRIETARIO),
      );
    });

    it("deve lançar BadRequestException quando o cargo for inválido", async () => {
      await expect(
        controller.alterarCargoDoMembro(ORGANIZACAO_ID, MEMBRO_ID, { cargo: "CHEFE" }, vinculoProprietario),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });

  describe("removerMembro", () => {
    it("deve enviar o comando com o cargo verificado pelo guard e não devolver corpo", async () => {
      commandBus.execute.mockResolvedValue(Result.passar(undefined));

      const resposta = await controller.removerMembro(ORGANIZACAO_ID, MEMBRO_ID, vinculoAdministrador);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new RemoverMembroCommand(TipoCargo.ADMINISTRADOR, ORGANIZACAO_ID, MEMBRO_ID),
      );
      expect(resposta).toBeUndefined();
    });

    it("deve lançar o erro de domínio quando o comando falhar", async () => {
      const erro = new PermissaoInsuficienteError();
      commandBus.execute.mockResolvedValue(Result.falhar(erro));

      await expect(controller.removerMembro(ORGANIZACAO_ID, MEMBRO_ID, vinculoAdministrador)).rejects.toBe(erro);
    });
  });
});
