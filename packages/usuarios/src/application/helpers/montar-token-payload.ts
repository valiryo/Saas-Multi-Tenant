import { VinculoEmpregaticio, VinculoEmpregaticioPublico } from "@saas/shared";
import { Sessao, Usuario } from "../../domain";
import { TokenPayload } from "../dtos/token-payload.dto";

export function montarTokenPayload(
    usuario: Usuario,
    sessao: Sessao,
    vinculos: VinculoEmpregaticio[],
): TokenPayload {
    const vinculoProps: VinculoEmpregaticioPublico[] = vinculos.map(vinculo => ({
        organizacaoId: vinculo.organizacaoId.valor,
        tipoCargo: vinculo.cargo,
    }));

    return {
        sid: sessao.sid.valor,
        sub: usuario.id.valor,
        email: usuario.email.valor,
        vinculoProps,
    };
}
