import { TokenPayload } from "../dtos/token-payload.dto";
import { TokensAutenticacao } from "../dtos/tokens-autenticacao.dto";

export interface IServicoTokenAutenticacao {
  gerarTokens(
    payload: TokenPayload,
  ): Promise<TokensAutenticacao>;
}