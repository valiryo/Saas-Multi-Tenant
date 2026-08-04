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
    private readonly id: Id;
    private readonly email: Email;
    private readonly senhaHash: SenhaHash;
    private readonly nome: NomeDePessoa;
    private readonly organizacaoIds: Id[];

    private constructor(props: UsuarioProps){
        this.id = props.id ?? Id.criar().value;
        this.email = props.email;
        this.senhaHash = props.senhaHash;
        this.nome = props.nome;
        this.organizacaoIds = props.organizacaoIds;
    }

    static criar(props: UsuarioProps): Result<Usuario> {
        return Result.ok(new Usuario(props));
    }
}