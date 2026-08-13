import { ICommand } from "@nestjs/cqrs";
import { Email } from "@shared/domain/value-objects/email";
import { SenhaForte } from "@users/domain/value-objects/senhaForte";

export class AutenticarUsuarioComando implements ICommand {
    constructor(
        public readonly email: string,
        public readonly senha: string,
    ){}
}