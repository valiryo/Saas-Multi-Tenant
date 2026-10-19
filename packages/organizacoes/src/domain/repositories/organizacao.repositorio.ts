import { Id, VinculoEmpregaticio } from "@saas/shared";
import { Organizacao } from "../entities/organizacao.entidade";
import { Slug } from "../value-objects/slug";


export interface IRepositorioOrganizacao {
    buscarPorId(id: Id): Promise<Organizacao | null>;
    buscarPorSlug(slug: Slug): Promise<Organizacao | null>;
    listarPorIds(ids: Id[]): Promise<Organizacao[]>;
    // Persiste a organização e o vínculo do seu criador na mesma transação: uma organização nunca existe sem dono
    salvarComVinculo(organizacao: Organizacao, vinculo: VinculoEmpregaticio): Promise<void>;
}
