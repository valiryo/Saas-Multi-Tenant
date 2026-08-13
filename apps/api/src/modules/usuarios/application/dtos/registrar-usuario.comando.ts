import { Email } from "@shared/domain/value-objects/email";
import { Id } from "@shared/domain/value-objects/id";
import { NomeDePessoa } from "@shared/domain/value-objects/nome-de-pessoa";
import { SenhaForte } from "src/modules/usuarios/domain/value-objects/senhaForte";

export class RegistrarUsuarioComando{
    constructor(
        public readonly email: string,
        public readonly senha: string,
        public readonly nome: string,
    ){}
}