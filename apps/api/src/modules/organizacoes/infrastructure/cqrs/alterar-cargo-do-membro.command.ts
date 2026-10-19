import { Command } from "@nestjs/cqrs";
import { Result, TipoCargo } from "@saas/shared";
import { MembroOutput } from "@saas/organizacoes";

export class AlterarCargoDoMembroCommand extends Command<Result<MembroOutput>>{
    constructor(
        public readonly cargoDoSolicitante: TipoCargo,
        public readonly organizacaoId: string,
        public readonly membroUsuarioId: string,
        public readonly novoCargo: TipoCargo,
    ){
        super()
    }
}
