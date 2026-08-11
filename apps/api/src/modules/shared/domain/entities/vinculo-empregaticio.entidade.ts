import { Id } from "@shared/domain/value-objects/id";
import { Result } from "@shared/domain/value-objects/result";

import { TipoCargo } from "../enums/tipo-cargo.enum";

interface VinculoEmpregaticioProps {
    id?: Id;
    usuarioId: Id;
    organizacaoId: Id;
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
        props: VinculoEmpregaticioProps,
    ): Result<VinculoEmpregaticio> {
        return Result.passar(
            new VinculoEmpregaticio(
                props.id ?? Id.criar().resultado,
                props.usuarioId,
                props.organizacaoId,
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