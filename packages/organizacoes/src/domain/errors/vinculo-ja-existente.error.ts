import { ErroDeDominio } from "@saas/shared";

export class VinculoJaExistenteError extends ErroDeDominio {
    constructor() {
        super("O usuário já possui um vínculo ativo nesta organização.");
    }
}
