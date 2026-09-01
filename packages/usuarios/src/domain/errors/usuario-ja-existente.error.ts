import { ErroDeDominio } from "@saas/shared";

export class UsuarioJaExistenteError extends ErroDeDominio {
    constructor(email: string) {
        super(`Usuário já existente para o Email Fornecido: ${email}`);
    }
}