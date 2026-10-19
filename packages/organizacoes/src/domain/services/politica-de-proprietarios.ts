import { VinculoEmpregaticio } from "@saas/shared";

export class PoliticaDeProprietarios {
    // Regra de negócio: a organização nunca pode ficar sem um PROPRIETARIO ativo
    static podeDeixarDeSerProprietario(
        alvo: VinculoEmpregaticio,
        vinculosAtivosDaOrganizacao: VinculoEmpregaticio[],
    ): boolean {
        if (!alvo.ehProprietarioAtivo()) {
            return true;
        }

        return vinculosAtivosDaOrganizacao.some(
            (vinculo) => vinculo.ehProprietarioAtivo() && !vinculo.id.equals(alvo.id),
        );
    }
}
