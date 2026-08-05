import { ErroDeDominio } from "@shared/domain/errors/erro-de-dominio";

export class UsuarioJaExistenteError extends ErroDeDominio {
    constructor(email: string) {
        super(`Usuário já existente para o Email Fornecido: ${email}`);
    }
}