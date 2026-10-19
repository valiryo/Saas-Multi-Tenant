import { describe, expect, it, vi } from "vitest";
import { Result, TipoCargo } from "@saas/shared";
import { AdicionarMembroCasoDeUso, AdicionarMembroInput, VinculoJaExistenteError } from "@saas/organizacoes";

import { AdicionarMembroCommand } from "@organizacoes/infrastructure/cqrs/adicionar-membro.command";
import { AdicionarMembroHandler } from "@organizacoes/infrastructure/cqrs/adicionar-membro.handler";

describe("AdicionarMembroHandler", () => {
  function criarHandler(resultado: Result<unknown>) {
    const casoDeUso = {
      executar: vi.fn().mockResolvedValue(resultado),
    } as unknown as AdicionarMembroCasoDeUso;
    return { handler: new AdicionarMembroHandler(casoDeUso), casoDeUso };
  }

  const comando = new AdicionarMembroCommand("organizacao", "membro@empresa.com", TipoCargo.FUNCIONARIO);

  it("deve repassar os dados do comando ao caso de uso e devolver o resultado", async () => {
    const output = { vinculoId: "vinculo-id" };
    const { handler, casoDeUso } = criarHandler(Result.passar(output));

    const resultado = await handler.execute(comando);

    expect(casoDeUso.executar).toHaveBeenCalledWith(
      new AdicionarMembroInput("organizacao", "membro@empresa.com", TipoCargo.FUNCIONARIO),
    );
    expect(resultado.resultado).toBe(output);
  });

  it("deve devolver a falha do caso de uso sem alterá-la", async () => {
    const erro = new VinculoJaExistenteError();
    const { handler } = criarHandler(Result.falhar(erro));

    expect((await handler.execute(comando)).falha).toBe(erro);
  });
});
