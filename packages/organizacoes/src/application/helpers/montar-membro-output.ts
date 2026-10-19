import { VinculoEmpregaticio } from "@saas/shared";
import { Usuario } from "@saas/usuarios";
import { MembroOutput } from "../dtos/membro.output";

export function montarMembroOutput(
    vinculo: VinculoEmpregaticio,
    usuario: Usuario,
): MembroOutput {
    return {
        vinculoId: vinculo.id.valor,
        usuarioId: vinculo.usuarioId.valor,
        nome: usuario.nome.nomeCompleto,
        email: usuario.email.valor,
        cargo: vinculo.cargo,
        ativo: vinculo.estaAtivo,
        membroDesde: vinculo.criadoEm,
    };
}
