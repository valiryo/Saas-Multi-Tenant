import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AutenticarUsuarioComando } from "@users/application/dtos/autenticar-usuario.comando";
import { AutenticarUsuarioCasoDeUso } from "@users/application/use-cases/autenticar-usuario.caso-de-uso";

@CommandHandler(AutenticarUsuarioComando)
export class AutenticarUsuarioHandler implements ICommandHandler<AutenticarUsuarioComando>{
    constructor(
        private readonly autenticarUsuarioCasoDeUso: AutenticarUsuarioCasoDeUso
    ){}

    async execute(cmd: AutenticarUsuarioComando): Promise<any> {
        return this.autenticarUsuarioCasoDeUso.executar(cmd);
    }
}