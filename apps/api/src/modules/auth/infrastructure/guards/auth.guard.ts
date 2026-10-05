import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '@saas/usuarios';
import { Request } from 'express';
import { apiConfig } from 'src/config/api.config';
import { ValidarSessaoQuery } from '@users/infrastructure/cqrs/validar-sessao.query';
import { IS_PUBLIC_ROUTE_KEY} from '../decorators/public-route.decorator';

type AccessTokenPayload = TokenPayload & { type?: string };

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly queryBus: QueryBus,
        @Inject(apiConfig.KEY)
        private readonly config: ConfigType<typeof apiConfig>
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if(isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extrairTokenDoHeader(request);
        if (!token) throw new UnauthorizedException()

        const payload = await this.verificarAccessToken(token);
        if (!payload || payload.type !== 'access') throw new UnauthorizedException()

        // Sessão consultada a cada request: revogação (logout, encerrar sessões) vale imediatamente
        const sessaoResult = await this.queryBus.execute(new ValidarSessaoQuery(payload.sub, payload.sid))
        if (sessaoResult.isFalha) throw new UnauthorizedException(sessaoResult.falha.message)

        request['user'] = payload;

        return true;
    }

    private async verificarAccessToken(token: string): Promise<AccessTokenPayload | null> {
        try {
            return await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
                secret: this.config.jwtAccessSecret
            })
        } catch {
            return null
        }
    }

    private extrairTokenDoHeader(request: Request): string | undefined {
        const [authType, token] = request.headers.authorization?.split(' ') ?? [];
        return authType === "Bearer" ? token : undefined;
    }
}
