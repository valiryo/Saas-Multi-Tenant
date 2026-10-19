import { describe, expect, it, vi } from "vitest";
import { Result, TipoCargo } from "@saas/shared";
import {
  PermissaoInsuficienteError,
  VerificarCargoNaOrganizacaoCasoDeUso,
  VerificarCargoNaOrganizacaoInput,
} from "@saas/organizacoes";

import { VerificarCargoNaOrganizacaoQuery } from "@organizacoes/infrastructure/cqrs/verificar-cargo-na-organizacao.query";
import { VerificarCargoNaOrganizacaoHandler } from "@organizacoes/infrastructure/cqrs/verificar-cargo-na-organizacao.handler";

describe("VerificarCargoNaOrganizacaoHandler", () => {
  function criarHandler(resultado: Result<unknown>) {
    const casoDeUso = {
      executar: vi.fn().mockResolvedValue(resultado),
    } as unknown as VerificarCargoNaOrganizacaoCasoDeUso;
    return { handler: new VerificarCargoNaOrganizacaoHandler(casoDeUso), casoDeUso };
  }

  const query = new VerificarCargoNaOrganizacaoQuery("usuario", "organizacao", [TipoCargo.PROPRIETARIO]);

  it("deve repassar os dados da query ao caso de uso e devolver o resultado", async () => {
    const vinculo = { organizacaoId: "organizacao", tipoCargo: TipoCargo.PROPRIETARIO };
    const { handler, casoDeUso } = criarHandler(Result.passar(vinculo));

    const resultado = await handler.execute(query);

    expect(casoDeUso.executar).toHaveBeenCalledWith(
      new VerificarCargoNaOrganizacaoInput("usuario", "organizacao", [TipoCargo.PROPRIETARIO]),
    );
    expect(resultado.resultado).toBe(vinculo);
  });

  it("deve devolver a falha do caso de uso sem alterá-la", async () => {
    const erro = new PermissaoInsuficienteError();
    const { handler } = criarHandler(Result.falhar(erro));

    expect((await handler.execute(query)).falha).toBe(erro);
  });
});
