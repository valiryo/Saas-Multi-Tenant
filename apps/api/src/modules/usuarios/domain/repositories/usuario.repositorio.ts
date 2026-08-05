import { Email } from "@shared/domain/value-objects/email";
import { Usuario } from "../entities/usuario.entidade";


export interface IRepositorioUsuario {
    buscarPorEmail(email: Email): Promise<Usuario | null>;
    salvar(usuario: Usuario): Promise<Usuario>;
}