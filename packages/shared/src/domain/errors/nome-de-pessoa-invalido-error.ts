import { NAME_MIN_LENGTH } from "../constraints/constraints";
import { ErroDeDominio } from "./erro-de-dominio";

export class NomeDePessoaInvalidoError extends ErroDeDominio{
    constructor(mensagem: string){
        super(`Nome de pessoa inválido: ${mensagem}. O nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres e conter pelo menos um sobrenome.`);
    }
}