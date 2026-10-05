import { Command } from "@nestjs/cqrs";
import { Result } from "@saas/shared";

export class EncerrarOutrasSessoesCommand extends Command<Result<void>>{
    constructor(
        public readonly usuarioId: string,
        public readonly sidAtual: string,
    ){
        super()
    }
}
