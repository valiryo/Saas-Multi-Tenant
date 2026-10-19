import { ErroDeDominio } from "@saas/shared";

export class UltimoProprietarioError extends ErroDeDominio {
    constructor() {
        super("A organização precisa de ao menos um PROPRIETARIO ativo. Promova outro membro antes de continuar.");
    }
}
