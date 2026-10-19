import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { AdicionarMembroCasoDeUso, AdicionarMembroInput, MembroOutput } from "@saas/organizacoes";
import { AdicionarMembroCommand } from "./adicionar-membro.command";

@CommandHandler(AdicionarMembroCommand)
export class AdicionarMembroHandler implements ICommandHandler<AdicionarMembroCommand>{
    constructor(
        private readonly adicionarMembroCasoDeUso: AdicionarMembroCasoDeUso
    ){}

    async execute(cmd: AdicionarMembroCommand): Promise<Result<MembroOutput>> {
        return this.adicionarMembroCasoDeUso.executar(
            new AdicionarMembroInput(cmd.organizacaoId, cmd.novoMembroEmail, cmd.cargo)
        )
    }
}
