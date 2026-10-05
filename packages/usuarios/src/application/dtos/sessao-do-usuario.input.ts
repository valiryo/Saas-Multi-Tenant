/**
 * Identifica uma sessão a partir do usuário autenticado.
 * Usado para validar, encerrar uma sessão específica, encerrar as demais ou listar as ativas
 * (neste caso, `sid` é a sessão atual).
 */
export class SessaoDoUsuarioInput {
    constructor(
        public readonly usuarioId: string,
        public readonly sid: string,
    ){}
}
