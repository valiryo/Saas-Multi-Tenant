import { Email, Id } from "@saas/shared";
import { Usuario } from "../entities/usuario.entidade";


export interface IRepositorioUsuario {
    buscarPorId(id: Id): Promise<Usuario | null>;
    buscarPorEmail(email: Email): Promise<Usuario | null>;
    salvar(usuario: Usuario): Promise<Usuario>;
}
