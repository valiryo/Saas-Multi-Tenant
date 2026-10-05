import { BadRequestException, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UnauthorizedException, Body, Inject, Req, Res } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AutenticarUsuarioCommand } from "@users/infrastructure/cqrs/autenticar-usuario.command";
import { RenovarTokensCommand } from "@users/infrastructure/cqrs/renovar-tokens.command";
import { EncerrarSessaoCommand } from "@users/infrastructure/cqrs/encerrar-sessao.command";
import { EncerrarOutrasSessoesCommand } from "@users/infrastructure/cqrs/encerrar-outras-sessoes.command";
import { ListarSessoesAtivasQuery } from "@users/infrastructure/cqrs/listar-sessoes-ativas.query";
import { Public } from "./infrastructure/decorators/public-route.decorator";
import { CurrentUser } from "./infrastructure/decorators/current-user.decorator";
import type { CookieOptions, Request, Response } from "express";
import type { ConfigType } from "@nestjs/config";
import { apiConfig } from "src/config/api.config";
import ms from "ms";
import { DURACAO_SESSAO, type TokenPayload } from "@saas/usuarios";

const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        @Inject(apiConfig.KEY)
        private readonly config: ConfigType<typeof apiConfig>
    ) { }

    @Public()
    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: any, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const { email, senha } = body ?? {};
        if (!email || !senha) {
            throw new BadRequestException('Email e senha são obrigatórios');
        }

        const cmd = new AutenticarUsuarioCommand(
            email,
            senha,
            request.ip ?? '',
            request.headers['user-agent'] ?? 'desconhecido',
        )
        const result = await this.commandBus.execute(cmd)

        if (result.isFalha) throw result.falha
        const { accessToken, refreshToken } = result.resultado

        this.definirCookieRefresh(response, refreshToken)

        return { accessToken }
    }

    @Public()
    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    async renovarTokens(
        @Req() request: Request, @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];
        if (!refreshToken) throw new UnauthorizedException("Sessão Expirada. Faça Login Novamente.")

        const result = await this.commandBus.execute(new RenovarTokensCommand(refreshToken))
        if (result.isFalha) {
            this.limparCookieRefresh(response)
            throw result.falha
        }

        const { accessToken, refreshToken: novoRefreshToken } = result.resultado
        this.definirCookieRefresh(response, novoRefreshToken)

        return { accessToken }
    }

    @Post("logout")
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@CurrentUser() usuario: TokenPayload, @Res({ passthrough: true }) response: Response) {
        const result = await this.commandBus.execute(new EncerrarSessaoCommand(usuario.sub, usuario.sid))

        this.limparCookieRefresh(response)

        if (result.isFalha) throw result.falha
    }

    @Get("sessoes")
    async listarSessoes(@CurrentUser() usuario: TokenPayload) {
        const result = await this.queryBus.execute(new ListarSessoesAtivasQuery(usuario.sub, usuario.sid))

        if (result.isFalha) throw result.falha

        return result.resultado
    }

    @Post("sessoes/encerrar-outras")
    @HttpCode(HttpStatus.NO_CONTENT)
    async encerrarOutrasSessoes(@CurrentUser() usuario: TokenPayload) {
        const result = await this.commandBus.execute(new EncerrarOutrasSessoesCommand(usuario.sub, usuario.sid))

        if (result.isFalha) throw result.falha
    }

    @Delete("sessoes/:sid")
    @HttpCode(HttpStatus.NO_CONTENT)
    async encerrarSessao(
        @CurrentUser() usuario: TokenPayload,
        @Param("sid") sid: string,
        @Res({ passthrough: true }) response: Response
    ) {
        const result = await this.commandBus.execute(new EncerrarSessaoCommand(usuario.sub, sid))

        if (result.isFalha) throw result.falha

        if (sid === usuario.sid) this.limparCookieRefresh(response)
    }

    private opcoesCookieRefresh(): CookieOptions {
        return {
            httpOnly: true,
            secure: this.config.nodeEnv === 'production',
            sameSite: 'strict',
        }
    }

    private definirCookieRefresh(response: Response, refreshToken: string): void {
        response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
            ...this.opcoesCookieRefresh(),
            maxAge: ms(DURACAO_SESSAO),
        })
    }

    private limparCookieRefresh(response: Response): void {
        response.clearCookie(REFRESH_TOKEN_COOKIE, this.opcoesCookieRefresh())
    }
}
