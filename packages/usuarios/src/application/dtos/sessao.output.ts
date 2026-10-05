export interface SessaoOutput {
    readonly sid: string;
    readonly userAgent: string;
    readonly ipAddress: string;
    readonly criadaEm: Date;
    readonly expiraEm: Date;
    readonly atual: boolean;
}
