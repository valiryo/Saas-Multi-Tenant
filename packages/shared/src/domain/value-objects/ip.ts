import { isIP } from "node:net";
import { Result } from "./result";
import { FormatadorDeTexto } from "../../helpers";
import { IpInvalidoError } from "../errors/ip-invalido.error";

export class Ip {
  private readonly _valor: string;

  private constructor(valor: string) {
    this._valor = valor;
  }

  public static criar(valor: string): Result<Ip> {
    const ipFormatado =
      FormatadorDeTexto.trimEspacosExtras(valor);

    if (!this.validar(ipFormatado)) {
      return Result.falhar(
        new IpInvalidoError(valor),
      );
    }

    return Result.passar(
      new Ip(ipFormatado),
    );
  }

  private static validar(valor: string): boolean {
    return isIP(valor) !== 0;
  }

  public get valor(): string {
    return this._valor;
  }

  public equals(outro: Ip): boolean {
    return this._valor === outro._valor;
  }
}