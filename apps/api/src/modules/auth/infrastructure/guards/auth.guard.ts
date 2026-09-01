import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '@saas/usuarios';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { apiConfig } from 'src/config/api.config';
import { IS_PUBLIC_ROUTE_KEY} from '../decorators/public-route.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
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

        if(isPublic) return Promise.resolve(true);

        const request = context.switchToHttp().getRequest();
        const token = this.extrairTokenDoHeader(request);
        if (!token) throw new UnauthorizedException()

        try {
            const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
                secret: this.config.jwtAccessSecret
            })

            request['user'] = payload;
        }
        catch {
            throw new UnauthorizedException()
        }

        return Promise.resolve(true);
    }

    private extrairTokenDoHeader(request: Request): string | undefined {
        const [authType, token] = request.headers.authorization?.split(' ') ?? [];
        return authType === "Bearer" ? token : undefined;
    }
}


