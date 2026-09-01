import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegistrarUsuarioCasoDeUso } from "@saas/usuarios";
import { RegistrarUsuarioCommand, RegistrarUsuarioCommandResult } from "./registrar-usuario.command";
import { Result } from "@saas/shared";

@CommandHandler(RegistrarUsuarioCommand)
export class RegistrarUsuarioHandler implements ICommandHandler<RegistrarUsuarioCommand> {
    constructor(
        private readonly registrarUsuarioCasoDeUso: RegistrarUsuarioCasoDeUso
    ){}

    async execute(cmd: RegistrarUsuarioCommand): Promise<Result<RegistrarUsuarioCommandResult>> {
        const result = await this.registrarUsuarioCasoDeUso.executar(cmd)

        if(result.isFalha) return Result.falhar(result.falha);
        const usuario = result.resultado;

        return Result.passar({
            id: usuario.id.valor,
            email: usuario.email.valor
        })
    }
}