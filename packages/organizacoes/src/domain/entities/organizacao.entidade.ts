import { Id, Result } from "@saas/shared";
import { NomeDaOrganizacao } from "../value-objects/nome-da-organizacao";
import { Slug } from "../value-objects/slug";

export interface CriarOrganizacaoProps {
    id?: string;
    nome: string;
    slug?: string;
}

interface OrganizacaoProps {
    id: Id;
    nome: NomeDaOrganizacao;
    slug: Slug;
}

export class Organizacao {
    private readonly _id: Id;
    private readonly _nome: NomeDaOrganizacao;
    private readonly _slug: Slug;

    private constructor(props: OrganizacaoProps) {
        this._id = props.id;
        this._nome = props.nome;
        this._slug = props.slug;
    }

    static criar(props: CriarOrganizacaoProps): Result<Organizacao> {
        const idResult = Id.criar(props.id);
        if (idResult.isFalha) {
            return Result.falhar(idResult.falha);
        }

        const nomeResult = NomeDaOrganizacao.criar(props.nome);
        if (nomeResult.isFalha) {
            return Result.falhar(nomeResult.falha);
        }

        const slugResult = Slug.criar(props.slug ?? props.nome);
        if (slugResult.isFalha) {
            return Result.falhar(slugResult.falha);
        }

        return Result.passar(new Organizacao({
            id: idResult.resultado,
            nome: nomeResult.resultado,
            slug: slugResult.resultado,
        }));
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
