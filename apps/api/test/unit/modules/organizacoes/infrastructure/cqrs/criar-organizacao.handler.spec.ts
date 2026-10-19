import { describe, expect, it, vi } from "vitest";
import { Result } from "@saas/shared";
import { CriarOrganizacaoCasoDeUso, CriarOrganizacaoInput, OrganizacaoNaoEncontradaError } from "@saas/organizacoes";

import { CriarOrganizacaoCommand } from "@organizacoes/infrastructure/cqrs/criar-organizacao.command";
import { CriarOrganizacaoHandler } from "@organizacoes/infrastructure/cqrs/criar-organizacao.handler";

describe("CriarOrganizacaoHandler", () => {
  const CRIADOR_ID = "550e8400-e29b-41d4-a716-446655440000";

  function criarHandler(resultado: Result<unknown>) {
    const casoDeUso = {
      executar: vi.fn().mockResolvedValue(resultado),
    } as unknown as CriarOrganizacaoCasoDeUso;
    return { handler: new CriarOrganizacaoHandler(casoDeUso), casoDeUso };
  }

  it("deve repassar os dados do comando ao caso de uso e devolver o resultado", async () => {
    const output = { id: "org-id", nome: "Empresa", slug: "empresa", criadoEm: new Date() };
    const { handler, casoDeUso } = criarHandler(Result.passar(output));

    const resultado = await handler.execute(new CriarOrganizacaoCommand("Empresa", CRIADOR_ID, "empresa"));

    expect(casoDeUso.executar).toHaveBeenCalledWith(new CriarOrganizacaoInput("Empresa", CRIADOR_ID, "empresa"));
    expect(resultado.resultado).toBe(output);
  });

  it("deve devolver a falha do caso de uso sem alterá-la", async () => {
    const erro = new OrganizacaoNaoEncontradaError();
    const { handler } = criarHandler(Result.falhar(erro));

    const resultado = await handler.execute(new CriarOrganizacaoCommand("Empresa", CRIADOR_ID));

    expect(resultado.falha).toBe(erro);
  });
});
