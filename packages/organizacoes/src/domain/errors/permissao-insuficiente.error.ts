import { ErroDeDominio } from "@saas/shared";

export class PermissaoInsuficienteError extends ErroDeDominio {
    constructor() {
        super("Você não tem permissão para realizar esta ação nesta organização.");
    }
}
