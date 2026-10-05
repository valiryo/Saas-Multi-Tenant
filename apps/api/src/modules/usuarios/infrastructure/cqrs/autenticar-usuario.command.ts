import { Command } from "@nestjs/cqrs";
import { Result } from "@saas/shared";

export interface AutenticarUsuarioCommandResult {
    accessToken: string,
    refreshToken: string
}

export class AutenticarUsuarioCommand extends Command<Result<AutenticarUsuarioCommandResult>>{
    constructor(
        public readonly email: string,
        public readonly senha: string,
        public readonly ipAddress: string,
        public readonly userAgent: string,
    ){
        super()
    }
}
