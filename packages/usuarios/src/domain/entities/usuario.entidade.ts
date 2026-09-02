import { SenhaHash } from "../value-objects/senhaHash";
import { Id } from "@saas/shared";
import { Email } from "@saas/shared";
import { NomeDePessoa } from "@saas/shared";
import { Result } from "@saas/shared";

export interface CriarUsuarioProps {
    id?: string;
    email: string;
    senhaHash: string;
    nome: string;
}

interface UsuarioProps {
    id: Id;
    email: Email;
    senhaHash: SenhaHash;
    nome: NomeDePessoa;
}

export class Usuario {
    private readonly _id: Id;
    private readonly _email: Email;
    private readonly _senhaHash: SenhaHash;
    private readonly _nome: NomeDePessoa;

    private constructor(props: UsuarioProps){
        this._id = props.id;
        this._email = props.email;
        this._senhaHash = props.senhaHash;
        this._nome = props.nome;
    }

    static criar(props: CriarUsuarioProps): Result<Usuario> {
        const idResult = Id.criar(props.id);
        if (idResult.isFalha) {
            return Result.falhar(idResult.falha);
        }

        const emailResult = Email.criar(props.email);
        if (emailResult.isFalha) {
            return Result.falhar(emailResult.falha);
        }

        const senhaHashResult = SenhaHash.criar(props.senhaHash);
        if (senhaHashResult.isFalha) {
            return Result.falhar(senhaHashResult.falha);
        }

        const nomeResult = NomeDePessoa.criar(props.nome);
        if (nomeResult.isFalha) {
            return Result.falhar(nomeResult.falha);
        }

        return Result.passar(new Usuario({
            id: idResult.resultado,
            email: emailResult.resultado,
            senhaHash: senhaHashResult.resultado,
            nome: nomeResult.resultado,
        }));
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
}