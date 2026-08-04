import { Email } from "@shared/domain/value-objects/email";
import { User } from "../entities/usuario.entidade";


export interface IRepositorioUsuario {
    buscarPorEmail(email: Email): Promise<User | null>;
    salvar(usuario: User): Promise<User>
}