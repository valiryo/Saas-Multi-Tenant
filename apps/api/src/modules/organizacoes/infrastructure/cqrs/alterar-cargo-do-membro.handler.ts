import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { AlterarCargoDoMembroCasoDeUso, AlterarCargoDoMembroInput, MembroOutput } from "@saas/organizacoes";
import { AlterarCargoDoMembroCommand } from "./alterar-cargo-do-membro.command";

@CommandHandler(AlterarCargoDoMembroCommand)
export class AlterarCargoDoMembroHandler implements ICommandHandler<AlterarCargoDoMembroCommand>{
    constructor(
        private readonly alterarCargoDoMembroCasoDeUso: AlterarCargoDoMembroCasoDeUso
    ){}

    async execute(cmd: AlterarCargoDoMembroCommand): Promise<Result<MembroOutput>> {
        return this.alterarCargoDoMembroCasoDeUso.executar(
            new AlterarCargoDoMembroInput(cmd.cargoDoSolicitante, cmd.organizacaoId, cmd.membroUsuarioId, cmd.novoCargo)
        )
    }
}
