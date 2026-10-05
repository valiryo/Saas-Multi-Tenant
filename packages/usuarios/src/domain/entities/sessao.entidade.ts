import { Id, Ip, Result } from "@saas/shared";
import { SessaoExpiracaoInvalidaError } from "../errors/sessao-expiracao-invalida.error";

export interface CriarSessaoProps {
    sid?: string,
    usuarioId: string,
    userAgent: string,
    ipAddress: string,
    ativo?: boolean,
    criadaEm?: Date,
    expiraEm: Date,
}

interface SessaoProps {
    sid: Id,
    usuarioId: Id,
    userAgent: string,
    ipAddress: Ip,
    ativo: boolean,
    criadaEm: Date,
    expiraEm: Date,
}

export class Sessao {
    private readonly _sid: Id;
    private readonly _usuarioId: Id;
    private readonly _userAgent: string;
    private readonly _ipAddress: Ip;
    private _ativo: boolean;
    private readonly _criadaEm: Date;
    private readonly _expiraEm: Date;

    private constructor(props: SessaoProps) {
        this._sid = props.sid;
        this._usuarioId = props.usuarioId;
        this._userAgent = props.userAgent;
        this._ipAddress = props.ipAddress;
        this._ativo = props.ativo;
        this._criadaEm = props.criadaEm;
        this._expiraEm = props.expiraEm;
    }

    get sid(): Id {
        return this._sid;
    }

    get usuarioId(): Id {
        return this._usuarioId;
    }

    get userAgent(): string {
        return this._userAgent;
    }

    get ipAddress(): Ip {
        return this._ipAddress;
    }

    get criadaEm(): Date {
        return this._criadaEm;
    }

    get expiraEm(): Date {
        return this._expiraEm;
    }

    // Uma sessão só está ativa se não foi revogada E não expirou pelo tempo
    public get ativo(): boolean {
        return this._ativo && !this.estaExpirada();
    }

    // Regra de negócio: verifica se a sessão já passou do prazo de validade
    public estaExpirada(dataReferencia: Date = new Date()): boolean {
        return dataReferencia > this._expiraEm;
    }

    public pertenceA(usuarioId: Id): boolean {
        return this._usuarioId.equals(usuarioId);
    }

    // Regra de negócio: a sessão só pode ser usada pelo seu dono, enquanto não revogada nem expirada
    public estaValidaPara(usuarioId: Id, dataReferencia: Date = new Date()): boolean {
        return this._ativo
            && !this.estaExpirada(dataReferencia)
            && this.pertenceA(usuarioId);
    }

    public revogar(): void {
        this._ativo = false;
    }

    public static criar(props: CriarSessaoProps): Result<Sessao> {
        const sidResult = Id.criar(props.sid);
        if (sidResult.isFalha) {
            return Result.falhar(sidResult.falha);
        }

        const usuarioIdResult = Id.criar(props.usuarioId);
        if (usuarioIdResult.isFalha) {
            return Result.falhar(usuarioIdResult.falha);
        }

        const ipResult = Ip.criar(props.ipAddress);
        if (ipResult.isFalha) {
            return Result.falhar(ipResult.falha);
        }

        const criadaEm = props.criadaEm ?? new Date();

        if (props.expiraEm <= criadaEm) {
            return Result.falhar(new SessaoExpiracaoInvalidaError());
        }

        return Result.passar(new Sessao({
            sid: sidResult.resultado,
            usuarioId: usuarioIdResult.resultado,
            userAgent: props.userAgent,
            ipAddress: ipResult.resultado,
            ativo: props.ativo ?? true,
            criadaEm,
            expiraEm: props.expiraEm,
        }));
    }
}
