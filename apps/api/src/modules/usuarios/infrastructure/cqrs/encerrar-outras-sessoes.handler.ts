import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EncerrarOutrasSessoesCasoDeUso, SessaoDoUsuarioInput } from "@saas/usuarios";
import { Result } from "@saas/shared";
import { EncerrarOutrasSessoesCommand } from "./encerrar-outras-sessoes.command";

@CommandHandler(EncerrarOutrasSessoesCommand)
export class EncerrarOutrasSessoesHandler implements ICommandHandler<EncerrarOutrasSessoesCommand>{
    constructor(
        private readonly encerrarOutrasSessoesCasoDeUso: EncerrarOutrasSessoesCasoDeUso
    ){}

    async execute(cmd: EncerrarOutrasSessoesCommand): Promise<Result<void>> {
        return this.encerrarOutrasSessoesCasoDeUso.executar(new SessaoDoUsuarioInput(cmd.usuarioId, cmd.sidAtual))
    }
}
