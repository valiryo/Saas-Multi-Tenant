import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { CriarOrganizacaoCasoDeUso, CriarOrganizacaoInput, OrganizacaoOutput } from "@saas/organizacoes";
import { CriarOrganizacaoCommand } from "./criar-organizacao.command";

@CommandHandler(CriarOrganizacaoCommand)
export class CriarOrganizacaoHandler implements ICommandHandler<CriarOrganizacaoCommand>{
    constructor(
        private readonly criarOrganizacaoCasoDeUso: CriarOrganizacaoCasoDeUso
    ){}

    async execute(cmd: CriarOrganizacaoCommand): Promise<Result<OrganizacaoOutput>> {
        return this.criarOrganizacaoCasoDeUso.executar(new CriarOrganizacaoInput(cmd.nome, cmd.criadorId, cmd.slug))
    }
}
