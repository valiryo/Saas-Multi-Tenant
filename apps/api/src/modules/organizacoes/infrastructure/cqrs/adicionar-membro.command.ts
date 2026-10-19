import { Command } from "@nestjs/cqrs";
import { Result, TipoCargo } from "@saas/shared";
import { MembroOutput } from "@saas/organizacoes";

export class AdicionarMembroCommand extends Command<Result<MembroOutput>>{
    constructor(
        public readonly organizacaoId: string,
        public readonly novoMembroEmail: string,
        public readonly cargo: TipoCargo,
    ){
        super()
    }
}
