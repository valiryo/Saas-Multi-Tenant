import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RenovarTokensCasoDeUso, RenovarTokensInput } from "@saas/usuarios";
import { Result } from "@saas/shared";
import { RenovarTokensCommand, RenovarTokensCommandResult } from "./renovar-tokens.command";

@CommandHandler(RenovarTokensCommand)
export class RenovarTokensHandler implements ICommandHandler<RenovarTokensCommand>{
    constructor(
        private readonly renovarTokensCasoDeUso: RenovarTokensCasoDeUso
    ){}

    async execute(cmd: RenovarTokensCommand): Promise<Result<RenovarTokensCommandResult>> {
        const result = await this.renovarTokensCasoDeUso.executar(new RenovarTokensInput(cmd.refreshToken))

        if(result.isFalha) return Result.falhar(result.falha)

        const resultado = result.resultado
        return Result.passar({
            accessToken: resultado.accessToken,
            refreshToken: resultado.refreshToken
        })
    }
}
