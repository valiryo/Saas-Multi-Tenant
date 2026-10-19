import { Id } from "../value-objects/id";
import { Result } from "../value-objects/result";
import { IdMalFormatadoError } from "../errors/id-mal-formatado-error";

import { TipoCargo } from "../enums/tipo-cargo.enum";

export interface CriarVinculoEmpregaticioProps {
    id?: string;
    usuarioId: string;
    organizacaoId: string;
    cargo: TipoCargo;
    ativo?: boolean;
    criadoEm?: Date;
}

export class VinculoEmpregaticio {
    private constructor(
        private readonly _id: Id,
        private readonly _usuarioId: Id,
        private readonly _organizacaoId: Id,
        private _cargo: TipoCargo,
        private _ativo: boolean,
        private readonly _criadoEm: Date,
    ) {}

    public static criar(
        props: CriarVinculoEmpregaticioProps,
    ): Result<VinculoEmpregaticio> {
        const idResult = Id.criar(props.id);
        if (idResult.isFalha) {
            return Result.falhar(idResult.falha);
        }

        const usuarioIdResult = VinculoEmpregaticio.criarReferencia(props.usuarioId);
        if (usuarioIdResult.isFalha) {
            return Result.falhar(usuarioIdResult.falha);
        }

        const organizacaoIdResult = VinculoEmpregaticio.criarReferencia(props.organizacaoId);
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
                props.criadoEm ?? new Date(),
            ),
        );
    }

    // Usuário e organização são referências a registros existentes: sem valor, Id.criar geraria um id novo
    private static criarReferencia(
        valor: string,
    ): Result<Id> {
        if (!valor) {
            return Result.falhar(new IdMalFormatadoError(valor ?? ""));
        }

        return Id.criar(valor);
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

    public ehProprietarioAtivo(): boolean {
        return this._ativo && this._cargo === TipoCargo.PROPRIETARIO;
    }

    // Um vínculo desativado não tem cargo algum, qualquer que seja o cargo registrado
    public possuiAlgumCargo(
        cargos: readonly TipoCargo[],
    ): boolean {
        return this._ativo && cargos.includes(this._cargo);
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

    public get criadoEm(): Date {
        return this._criadoEm;
    }
}
