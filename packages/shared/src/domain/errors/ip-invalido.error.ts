import { ErroDeDominio } from "./erro-de-dominio";

export class IpInvalidoError extends ErroDeDominio {
  constructor(ip: string) {
    super(`Endereço IP inválido: ${ip}`);
  }
}
