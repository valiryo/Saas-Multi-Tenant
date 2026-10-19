import { describe, expect, it, vi } from "vitest";
import { Result, TipoCargo } from "@saas/shared";
import { MembroNaoEncontradoError, RemoverMembroCasoDeUso, RemoverMembroInput } from "@saas/organizacoes";

import { RemoverMembroCommand } from "@organizacoes/infrastructure/cqrs/remover-membro.command";
import { RemoverMembroHandler } from "@organizacoes/infrastructure/cqrs/remover-membro.handler";

describe("RemoverMembroHandler", () => {
  function criarHandler(resultado: Result<unknown>) {
    const casoDeUso = {
      executar: vi.fn().mockResolvedValue(resultado),
    } as unknown as RemoverMembroCasoDeUso;
    return { handler: new RemoverMembroHandler(casoDeUso), casoDeUso };
  }

  const comando = new RemoverMembroCommand(TipoCargo.ADMINISTRADOR, "organizacao", "membro");

  it("deve repassar os dados do comando ao caso de uso", async () => {
    const { handler, casoDeUso } = criarHandler(Result.passar(undefined));

    const resultado = await handler.execute(comando);

    expect(casoDeUso.executar).toHaveBeenCalledWith(
      new RemoverMembroInput(TipoCargo.ADMINISTRADOR, "organizacao", "membro"),
    );
    expect(resultado.isSucesso).toBe(true);
  });

  it("deve devolver a falha do caso de uso sem alterá-la", async () => {
    const erro = new MembroNaoEncontradoError();
    const { handler } = criarHandler(Result.falhar(erro));

    expect((await handler.execute(comando)).falha).toBe(erro);
  });
});
