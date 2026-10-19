import { Command } from "@nestjs/cqrs";
import { Result, TipoCargo } from "@saas/shared";

export class RemoverMembroCommand extends Command<Result<void>>{
    constructor(
        public readonly cargoDoSolicitante: TipoCargo,
        public readonly organizacaoId: string,
        public readonly membroUsuarioId: string,
    ){
        super()
    }
}
