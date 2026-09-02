import { Organizacao } from "../entities/organizacao.entidade";
import { Slug } from "../value-objects/slug";


export interface IRepositorioOrganizacao {
    buscarPorSlug(slug: Slug): Promise<Organizacao | null>;
    salvar(organizacao: Organizacao): Promise<Organizacao>;
}
