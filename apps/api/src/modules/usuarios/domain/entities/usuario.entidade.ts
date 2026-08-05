import { ServicoCriptografia } from "../../../shared/domain/repositories/servico-criptografia";
import { SenhaHash } from "../value-objects/senhaHash";
import { Id } from "../../../shared/domain/value-objects/id";
import { Email } from "../../../shared/domain/value-objects/email";
import { SenhaForte } from "../value-objects/senhaForte";
import { NomeDePessoa } from "@shared/domain/value-objects/nome-de-pessoa";
import { Result } from "@shared/domain/value-objects/result";

export interface UsuarioProps {
    id?: Id;
    email: Email;
    senhaHash: SenhaHash;
    nome: NomeDePessoa;
    organizacaoIds: Id[];
}

export class Usuario {
    private readonly _id: Id;
    private readonly _email: Email;
    private readonly _senhaHash: SenhaHash;
    private readonly _nome: NomeDePessoa;
    private readonly _organizacaoIds: Id[];

    private constructor(props: UsuarioProps){
        this._id = props.id ?? Id.criar().resultado;
        this._email = props.email;
        this._senhaHash = props.senhaHash;
        this._nome = props.nome;
        this._organizacaoIds = props.organizacaoIds;
    }

    static criar(props: UsuarioProps): Result<Usuario> {
        return Result.passar(new Usuario(props));
    }

    get email(): Email {
        return this._email;
    }

    get id(): Id {
        return this._id;
    }

    get nome(): NomeDePessoa {
        return this._nome;
    }

    get senhaHash(): SenhaHash {
        return this._senhaHash;
    }

    get organizacaoIds(): readonly Id[] {
        return [...this._organizacaoIds];
    }

}