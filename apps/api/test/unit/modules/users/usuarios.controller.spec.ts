import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import type { CommandBus } from "@nestjs/cqrs";

import { Result } from "@saas/shared";
import { UsuarioJaExistenteError } from "@saas/usuarios";

import { UsuariosController } from "@users/usuarios.controller";
import { RegistrarUsuarioCommand } from "@users/infrastructure/cqrs/registrar-usuario.command";

describe("UsuariosController", () => {
  let commandBus: { execute: ReturnType<typeof vi.fn> };
  let controller: UsuariosController;

  beforeEach(() => {
    commandBus = { execute: vi.fn() };
    controller = new UsuariosController(commandBus as unknown as CommandBus);
  });

  describe("registrar", () => {
    const body = { email: "maria@empresa.com", senha: "Senha@123", nome: "Maria Silva" };

    it("deve enviar o comando de registro e devolver o resultado", async () => {
      commandBus.execute.mockResolvedValue(Result.passar({ id: "usuario-id", email: body.email }));

      const resposta = await controller.registrar(body);

      expect(commandBus.execute).toHaveBeenCalledWith(new RegistrarUsuarioCommand(body.email, body.senha, body.nome));
      expect(resposta).toEqual({ id: "usuario-id", email: body.email });
    });

    it.each([
      ["sem corpo", undefined],
      ["sem e-mail", { senha: body.senha, nome: body.nome }],
      ["sem senha", { email: body.email, nome: body.nome }],
      ["sem nome", { email: body.email, senha: body.senha }],
    ])("deve lançar BadRequestException (e não devolvê-la como resposta) %s", async (_, corpo) => {
      await expect(controller.registrar(corpo)).rejects.toBeInstanceOf(BadRequestException);
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it("deve lançar o erro de domínio quando o registro falhar", async () => {
      const erro = new UsuarioJaExistenteError(body.email);
      commandBus.execute.mockResolvedValue(Result.falhar(erro));

      await expect(controller.registrar(body)).rejects.toBe(erro);
    });
  });
});
