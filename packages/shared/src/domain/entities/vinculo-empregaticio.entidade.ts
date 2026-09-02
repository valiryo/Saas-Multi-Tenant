import { Id } from "../value-objects/id";
import { Result } from "../value-objects/result";

import { TipoCargo } from "../enums/tipo-cargo.enum";

export interface CriarVinculoEmpregaticioProps {
    id?: string;
    usuarioId: string;
    organizacaoId: string;
    cargo: TipoCargo;
    ativo?: boolean;
}

export class VinculoEmpregaticio {
    private constructor(
        private readonly _id: Id,
        private readonly _usuarioId: Id,
        private readonly _organizacaoId: Id,
        private _cargo: TipoCargo,
        private _ativo: boolean,
    ) {}

    public static criar(
        props: CriarVinculoEmpregaticioProps,
    ): Result<VinculoEmpregaticio> {
        const idResult = Id.criar(props.id);
        if (idResult.isFalha) {
            return Result.falhar(idResult.falha);
        }

        const usuarioIdResult = Id.criar(props.usuarioId);
        if (usuarioIdResult.isFalha) {
            return Result.falhar(usuarioIdResult.falha);
        }

        const organizacaoIdResult = Id.criar(props.organizacaoId);
        if (organizacaoIdResult.isFalha) {
            return Result.falhar(organizacaoIdResult.falha);
        }

        return Result.passar(
            new VinculoEmpregaticio(
                idResult.resultado,
                usuarioIdResult.resultado,
                organizacaoIdResult.resultado,
                props.cargo,
                props.ativo ?? true,
            ),
        );
    }

    public alterarCargo(
        novoCargo: TipoCargo,
    ): void {
        this._cargo = novoCargo;
    }

    public ativar(): void {
        this._ativo = true;
    }

    public desativar(): void {
        this._ativo = false;
    }

    public get id(): Id {
        return this._id;
    }

    public get usuarioId(): Id {
        return this._usuarioId;
    }

    public get organizacaoId(): Id {
        return this._organizacaoId;
    }

    public get cargo(): TipoCargo {
        return this._cargo;
    }

    public get estaAtivo(): boolean {
        return this._ativo;
    }
}