import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  IServicoTokenAutenticacao,
  TokenPayload,
  TokensAutenticacao,
} from '@saas/usuarios';

import { apiConfig } from 'src/config/api.config';

@Injectable()
export class JwtServicoTokenAutenticacao
  implements IServicoTokenAutenticacao
{
  constructor(
    private readonly jwtService: JwtService,

    @Inject(apiConfig.KEY)
    private readonly config: ConfigType<typeof apiConfig>,
  ) {}

  async gerarTokens(
    payload: TokenPayload,
  ): Promise<TokensAutenticacao> {
    const [accessToken, refreshToken] =
      await Promise.all([
        this.jwtService.signAsync(
          {
            ...payload,
            type: 'access',
          },
          {
            secret: this.config.jwtAccessSecret,
            expiresIn:
              this.config.jwtAccessExpiresIn
          },
        ),

        this.jwtService.signAsync(
          {
            sub: payload.sub,
            type: 'refresh',
          },
          {
            secret: this.config.jwtRefreshSecret,
            expiresIn:
              this.config.jwtRefreshExpiresIn
          },
        ),
      ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}