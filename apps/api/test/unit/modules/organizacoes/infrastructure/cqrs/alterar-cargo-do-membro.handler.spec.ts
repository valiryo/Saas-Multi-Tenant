import { describe, expect, it, vi } from "vitest";
import { Result, TipoCargo } from "@saas/shared";
import { AlterarCargoDoMembroCasoDeUso, AlterarCargoDoMembroInput, UltimoProprietarioError } from "@saas/organizacoes";

import { AlterarCargoDoMembroCommand } from "@organizacoes/infrastructure/cqrs/alterar-cargo-do-membro.command";
import { AlterarCargoDoMembroHandler } from "@organizacoes/infrastructure/cqrs/alterar-cargo-do-membro.handler";

describe("AlterarCargoDoMembroHandler", () => {
  function criarHandler(resultado: Result<unknown>) {
    const casoDeUso = {
      executar: vi.fn().mockResolvedValue(resultado),
    } as unknown as AlterarCargoDoMembroCasoDeUso;
    return { handler: new AlterarCargoDoMembroHandler(casoDeUso), casoDeUso };
  }

  const comando = new AlterarCargoDoMembroCommand(
    TipoCargo.PROPRIETARIO,
    "organizacao",
    "membro",
    TipoCargo.ADMINISTRADOR,
  );

  it("deve repassar os dados do comando ao caso de uso e devolver o resultado", async () => {
    const output = { vinculoId: "vinculo-id", cargo: TipoCargo.ADMINISTRADOR };
    const { handler, casoDeUso } = criarHandler(Result.passar(output));

    const resultado = await handler.execute(comando);

    expect(casoDeUso.executar).toHaveBeenCalledWith(
      new AlterarCargoDoMembroInput(TipoCargo.PROPRIETARIO, "organizacao", "membro", TipoCargo.ADMINISTRADOR),
    );
    expect(resultado.resultado).toBe(output);
  });

  it("deve devolver a falha do caso de uso sem alterá-la", async () => {
    const erro = new UltimoProprietarioError();
    const { handler } = criarHandler(Result.falhar(erro));

    expect((await handler.execute(comando)).falha).toBe(erro);
  });
});
