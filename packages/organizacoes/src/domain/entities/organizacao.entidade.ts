import { Id, Result } from "@saas/shared";
import { NomeDaOrganizacao } from "../value-objects/nome-da-organizacao";
import { Slug } from "../value-objects/slug";

export interface OrganizacaoProps {
    id?: Id;
    nome: NomeDaOrganizacao;
    slug: Slug;
}

export class Organizacao {
    private readonly _id: Id;
    private readonly _nome: NomeDaOrganizacao;
    private readonly _slug: Slug;

    private constructor(props: OrganizacaoProps) {
        this._id = props.id ?? Id.criar().resultado;
        this._nome = props.nome;
        this._slug = props.slug;
    }

    static criar(props: OrganizacaoProps): Result<Organizacao> {
        return Result.passar(new Organizacao(props));
    }

    get id(): Id {
        return this._id;
    }

    get nome(): NomeDaOrganizacao {
        return this._nome;
    }

    get slug(): Slug {
        return this._slug;
    }
}
