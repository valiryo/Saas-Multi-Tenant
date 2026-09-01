import { Command } from "@nestjs/cqrs";
import { Result } from "@saas/shared";

export interface RegistrarUsuarioCommandResult {
    id: string,
    email: string
}

export class RegistrarUsuarioCommand extends Command<Result<RegistrarUsuarioCommandResult>>{
    constructor(
        public readonly email: string,
        public readonly senha: string, 
        public readonly nome: string){
            super()
        }
}