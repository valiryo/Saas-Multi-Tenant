import { beforeEach, describe, expect, it } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';

import { TipoCargo } from '@saas/shared';
import type { TokenPayload } from '@saas/usuarios';

import { apiConfig } from 'src/config/api.config';
import { JwtServicoTokenAutenticacao } from '@users/infrastructure/services/jwt-token-servico-autenticacao';

describe('JwtServicoTokenAutenticacao', () => {
  const config = {
    jwtAccessSecret: 'access-secret',
    jwtRefreshSecret: 'refresh-secret',
    jwtAccessExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
  } as unknown as ConfigType<typeof apiConfig>;

  const payload: TokenPayload = {
    sid: '550e8400-e29b-41d4-a716-446655440001',
    sub: '550e8400-e29b-41d4-a716-446655440000',
    email: 'dev@mail.com',
    vinculoProps: [
      {
        organizacaoId: '550e8400-e29b-41d4-a716-446655440002',
        tipoCargo: TipoCargo.PROPRIETARIO,
      },
    ],
  };

  let jwtService: JwtService;
  let servico: JwtServicoTokenAutenticacao;

  beforeEach(() => {
    jwtService = new JwtService({});
    servico = new JwtServicoTokenAutenticacao(jwtService, config);
  });

  describe('gerarTokens', () => {
    it('deve gerar um access token com o payload completo e type=access', async () => {
      const { accessToken } = await servico.gerarTokens(payload);

      const decodificado = await jwtService.verifyAsync(accessToken, {
        secret: config.jwtAccessSecret,
      });

      expect(decodificado).toMatchObject({ ...payload, type: 'access' });
    });

    it('deve gerar um refresh token apenas com sub, sid e type=refresh', async () => {
      const { refreshToken } = await servico.gerarTokens(payload);

      const decodificado = await jwtService.verifyAsync(refreshToken, {
        secret: config.jwtRefreshSecret,
      });

      expect(decodificado).toMatchObject({
        sub: payload.sub,
        sid: payload.sid,
        type: 'refresh',
      });
      expect(decodificado).not.toHaveProperty('email');
      expect(decodificado).not.toHaveProperty('vinculoProps');
    });
  });

  describe('verificarRefreshToken', () => {
    it('deve retornar sub e sid de um refresh token válido', async () => {
      const { refreshToken } = await servico.gerarTokens(payload);

      expect(await servico.verificarRefreshToken(refreshToken)).toEqual({
        sub: payload.sub,
        sid: payload.sid,
      });
    });

    it('deve retornar null para um access token', async () => {
      const { accessToken } = await servico.gerarTokens(payload);

      expect(await servico.verificarRefreshToken(accessToken)).toBeNull();
    });

    it('deve retornar null para um token assinado com o secret de refresh mas sem type=refresh', async () => {
      const token = await jwtService.signAsync(
        { sub: payload.sub, sid: payload.sid, type: 'access' },
        { secret: config.jwtRefreshSecret },
      );

      expect(await servico.verificarRefreshToken(token)).toBeNull();
    });

    it('deve retornar null para um token expirado', async () => {
      const token = await jwtService.signAsync(
        { sub: payload.sub, sid: payload.sid, type: 'refresh' },
        { secret: config.jwtRefreshSecret, expiresIn: -10 },
      );

      expect(await servico.verificarRefreshToken(token)).toBeNull();
    });

    it('deve retornar null para um token malformado', async () => {
      expect(await servico.verificarRefreshToken('nao-e-um-jwt')).toBeNull();
    });
  });
});
