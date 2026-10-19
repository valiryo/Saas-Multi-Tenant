import { describe, expect, it, vi } from "vitest";
import { Result } from "@saas/shared";
import {
  ListarMembrosDaOrganizacaoCasoDeUso,
  ListarMembrosDaOrganizacaoInput,
  OrganizacaoNaoEncontradaError,
} from "@saas/organizacoes";

import { ListarMembrosDaOrganizacaoQuery } from "@organizacoes/infrastructure/cqrs/listar-membros-da-organizacao.query";
import { ListarMembrosDaOrganizacaoHandler } from "@organizacoes/infrastructure/cqrs/listar-membros-da-organizacao.handler";

describe("ListarMembrosDaOrganizacaoHandler", () => {
  function criarHandler(resultado: Result<unknown>) {
    const casoDeUso = {
      executar: vi.fn().mockResolvedValue(resultado),
    } as unknown as ListarMembrosDaOrganizacaoCasoDeUso;
    return { handler: new ListarMembrosDaOrganizacaoHandler(casoDeUso), casoDeUso };
  }

  const query = new ListarMembrosDaOrganizacaoQuery("organizacao");

  it("deve repassar a organização ao caso de uso e devolver o resultado", async () => {
    const membros = [{ vinculoId: "vinculo-id" }];
    const { handler, casoDeUso } = criarHandler(Result.passar(membros));

    const resultado = await handler.execute(query);

    expect(casoDeUso.executar).toHaveBeenCalledWith(new ListarMembrosDaOrganizacaoInput("organizacao"));
    expect(resultado.resultado).toBe(membros);
  });

  it("deve devolver a falha do caso de uso sem alterá-la", async () => {
    const erro = new OrganizacaoNaoEncontradaError();
    const { handler } = criarHandler(Result.falhar(erro));

    expect((await handler.execute(query)).falha).toBe(erro);
  });
});
