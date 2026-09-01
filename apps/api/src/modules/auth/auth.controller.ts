import { BadRequestException, Controller, HttpCode, HttpStatus, Post, UnauthorizedException, Body, Inject, Req, Res } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AutenticarUsuarioCommand } from "@users/infrastructure/cqrs/autenticar-usuario.command";
import { Public } from "./infrastructure/decorators/public-route.decorator";
import type { Request, Response } from "express";
import type { ConfigType } from "@nestjs/config";
import { apiConfig } from "src/config/api.config";
import ms from "ms";
import { JwtService } from "@nestjs/jwt";
import { TokenPayload } from "@saas/usuarios";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly jwtService: JwtService,
        private readonly commandBus: CommandBus,
        @Inject(apiConfig.KEY)
        private readonly config: ConfigType<typeof apiConfig>
    ) { }

    @Public()
    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: any, @Res({ passthrough: true }) response: Response) {
        const { email, senha } = body;
        if (!email || !senha) {
            throw new BadRequestException('Email e senha são obrigatórios');
        }

        const cmd = new AutenticarUsuarioCommand(email, senha)
        const result = await this.commandBus.execute(cmd)

        if (result.isFalha) throw result.falha
        const { accessToken, refreshToken } = result.resultado

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: this.config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: ms('7 days')
        })

        return {accessToken: accessToken}
    }

    @Public()
    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    async gerarNovoAccess(
        @Req() request: Request, @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies?.['refresh_token'];
        if (!refreshToken) throw new UnauthorizedException("Sessão Expirada. Faça Login Novamente.")

        try {
            const payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
                secret: this.config.jwtRefreshSecret
            })

            const novoPayload: TokenPayload = {
                sub: payload.sub,
                email: payload.email,
                nome: payload.nome
            }

            const novoAccessToken = this.jwtService.signAsync(novoPayload, {
                expiresIn: this.config.jwtAccessExpiresIn,
                secret: this.config.jwtAccessSecret,
            })

            return novoAccessToken

        } catch {
            response.clearCookie("refresh_token");
            throw new UnauthorizedException("Sessão Inválida. Faça Login Novamente.")
        }
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    }
}