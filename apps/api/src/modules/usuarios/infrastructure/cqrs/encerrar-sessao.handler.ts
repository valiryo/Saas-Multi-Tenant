import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EncerrarSessaoCasoDeUso, SessaoDoUsuarioInput } from "@saas/usuarios";
import { Result } from "@saas/shared";
import { EncerrarSessaoCommand } from "./encerrar-sessao.command";

@CommandHandler(EncerrarSessaoCommand)
export class EncerrarSessaoHandler implements ICommandHandler<EncerrarSessaoCommand>{
    constructor(
        private readonly encerrarSessaoCasoDeUso: EncerrarSessaoCasoDeUso
    ){}

    async execute(cmd: EncerrarSessaoCommand): Promise<Result<void>> {
        return this.encerrarSessaoCasoDeUso.executar(new SessaoDoUsuarioInput(cmd.usuarioId, cmd.sid))
    }
}
