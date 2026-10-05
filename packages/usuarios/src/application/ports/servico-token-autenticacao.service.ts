import { RefreshTokenPayload } from "../dtos/refresh-token-payload.dto";
import { TokenPayload } from "../dtos/token-payload.dto";
import { TokensAutenticacao } from "../dtos/tokens-autenticacao.dto";

export interface IServicoTokenAutenticacao {
  gerarTokens(
    payload: TokenPayload,
  ): Promise<TokensAutenticacao>;

  /**
   * Retorna o payload do refresh token se ele for válido (assinatura, expiração e tipo),
   * ou null caso contrário.
   */
  verificarRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload | null>;
}
