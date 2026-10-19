import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { RemoverMembroCasoDeUso, RemoverMembroInput } from "@saas/organizacoes";
import { RemoverMembroCommand } from "./remover-membro.command";

@CommandHandler(RemoverMembroCommand)
export class RemoverMembroHandler implements ICommandHandler<RemoverMembroCommand>{
    constructor(
        private readonly removerMembroCasoDeUso: RemoverMembroCasoDeUso
    ){}

    async execute(cmd: RemoverMembroCommand): Promise<Result<void>> {
        return this.removerMembroCasoDeUso.executar(
            new RemoverMembroInput(cmd.cargoDoSolicitante, cmd.organizacaoId, cmd.membroUsuarioId)
        )
    }
}
