import { Command } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { OrganizacaoOutput } from "@saas/organizacoes";

export class CriarOrganizacaoCommand extends Command<Result<OrganizacaoOutput>>{
    constructor(
        public readonly nome: string,
        public readonly criadorId: string,
        public readonly slug?: string,
    ){
        super()
    }
}
