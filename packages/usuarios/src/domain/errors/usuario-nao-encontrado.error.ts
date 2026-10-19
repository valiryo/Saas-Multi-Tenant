import { ErroDeDominio } from "@saas/shared";

export class UsuarioNaoEncontradoError extends ErroDeDominio {
    constructor() {
        super("Usuário não encontrado.");
    }
}
