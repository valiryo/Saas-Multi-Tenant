import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegistrarUsuarioComando } from "@users/application/dtos/registrar-usuario.comando";
import { RegistrarUsuarioCasoDeUso } from "@users/application/use-cases/register-user";

@CommandHandler(RegistrarUsuarioComando)
export class RegistrarUsuarioHandler implements ICommandHandler<RegistrarUsuarioComando> {
    constructor(
        private readonly registrarUsuarioCasoDeUso: RegistrarUsuarioCasoDeUso
    ){}

    async execute(cmd: RegistrarUsuarioComando): Promise<any> {
        return this.registrarUsuarioCasoDeUso.executar(cmd);
    }
}