import { Command } from "@nestjs/cqrs";
import { Result } from "@saas/shared";

export interface RenovarTokensCommandResult {
    accessToken: string,
    refreshToken: string
}

export class RenovarTokensCommand extends Command<Result<RenovarTokensCommandResult>>{
    constructor(
        public readonly refreshToken: string,
    ){
        super()
    }
}
