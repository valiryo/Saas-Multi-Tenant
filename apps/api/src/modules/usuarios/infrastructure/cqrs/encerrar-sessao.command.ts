import { Command } from "@nestjs/cqrs";
import { Result } from "@saas/shared";

export class EncerrarSessaoCommand extends Command<Result<void>>{
    constructor(
        public readonly usuarioId: string,
        public readonly sid: string,
    ){
        super()
    }
}
