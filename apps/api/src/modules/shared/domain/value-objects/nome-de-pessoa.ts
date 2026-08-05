import { NAME_MIN_LENGTH } from "../constraints/constraints";
import { ErroDeDominio } from "../errors/erro-de-dominio";
import { FormatadorDeTexto } from "@shared/helpers/formatador-de-texto";
import { Result } from "./result";
import { NomeDePessoaInvalidoError } from "../errors/nome-de-pessoa-invalido-error";

export class NomeDePessoa {
    private readonly _nomeCompleto: string;
    private readonly _primeiroNome: string;
    private readonly _sobrenome: string;

    private constructor(nome: string) {
        this._nomeCompleto = nome;
        const partesDoNome = nome.split(" ");
        this._primeiroNome = partesDoNome[0] ?? '';
        this._sobrenome = partesDoNome.slice(1).join(" ");
    }

    /**
     * Ponto de entrada único para criar um NomeDePessoa.
     * Retorna um Result com a instância ou um DomainError.
     */
    public static criar(nomeBruto: string): Result<NomeDePessoa> {
        const nomeFormatado = this.formatarNome(nomeBruto);

        // Executamos a validação
        const nomeResult = this.validar(nomeFormatado);
        if (nomeResult.isFalha) {
            return Result.falhar(nomeResult.falha);
        }

        // Se passar, retornamos o sucesso com o objeto instanciado
        return Result.passar(new NomeDePessoa(nomeFormatado));
    }

    private static validar(nome: string): Result<void> {
        const nomeLimpo = nome.trim();

        const isNomePequeno = nomeLimpo.length < NAME_MIN_LENGTH;
        const isNomeIncompleto = nomeLimpo.split(" ").length < 2;

        if (isNomePequeno || isNomeIncompleto) {
            return Result.falhar(new NomeDePessoaInvalidoError(nomeLimpo));
        }
        return Result.passar(undefined);
    }

    private static formatarNome(nome: string): string {
        if (!nome) return '';
        let limpo = FormatadorDeTexto.removerNumeros(nome);
        limpo = FormatadorDeTexto.removerCaracteresEspeciais(limpo);
        limpo = FormatadorDeTexto.trimEspacosExtras(limpo);
        limpo = FormatadorDeTexto.capitalizarPalavras(limpo);
        return limpo;
    }

    get nomeCompleto(): string { return this._nomeCompleto; }
    get primeiroNome(): string { return this._primeiroNome; }
    get sobrenome(): string { return this._sobrenome; }
}