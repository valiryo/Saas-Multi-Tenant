import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AutenticarUsuarioCasoDeUso, AutenticarUsuarioInput } from "@saas/usuarios";
import { AutenticarUsuarioCommand, AutenticarUsuarioCommandResult } from "./autenticar-usuario.command";
import { Result } from "@saas/shared";

@CommandHandler(AutenticarUsuarioCommand)
export class AutenticarUsuarioHandler implements ICommandHandler<AutenticarUsuarioCommand>{
    constructor(
        private readonly autenticarUsuarioCasoDeUso: AutenticarUsuarioCasoDeUso
    ){}

    async execute(cmd: AutenticarUsuarioCommand): Promise<Result<AutenticarUsuarioCommandResult>> {
        const result = await this.autenticarUsuarioCasoDeUso.executar(
            new AutenticarUsuarioInput(cmd.email, cmd.senha, cmd.ipAddress, cmd.userAgent)
        )

        if(result.isFalha) return Result.falhar(result.falha)

        const resultado = result.resultado
        return Result.passar({
            accessToken: resultado.accessToken,
            refreshToken: resultado.refreshToken
        })
    }
}
