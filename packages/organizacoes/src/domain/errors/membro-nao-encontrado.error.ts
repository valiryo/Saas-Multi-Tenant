import { ErroDeDominio } from "@saas/shared";

export class MembroNaoEncontradoError extends ErroDeDominio {
    constructor() {
        super("Membro não encontrado nesta organização.");
    }
}
