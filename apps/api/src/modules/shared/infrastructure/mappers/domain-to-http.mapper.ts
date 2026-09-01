import { BadRequestException, ConflictException, HttpException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { EmailInvalidoError, ErroDeDominio, IdMalFormatadoError, NomeDePessoaInvalidoError } from "@saas/shared";
import { CredenciaisInvalidasError, SenhaForteInvalidaError, SenhaHashInvalidaError, UsuarioJaExistenteError } from "@saas/usuarios";

export class DomainToHttpMapper {
    static map(erro: ErroDeDominio): HttpException {
        switch (true) {
            case erro instanceof EmailInvalidoError:
            case erro instanceof IdMalFormatadoError:
            case erro instanceof NomeDePessoaInvalidoError:
            case erro instanceof SenhaForteInvalidaError:
                return new BadRequestException(erro.message);

            case erro instanceof CredenciaisInvalidasError:
                return new UnauthorizedException(erro.message);

            case erro instanceof UsuarioJaExistenteError:
                return new ConflictException(erro.message);

            case erro instanceof SenhaHashInvalidaError:
                return new InternalServerErrorException(erro.message);

            default:
                return new InternalServerErrorException(erro.message);
        }
    }
}
