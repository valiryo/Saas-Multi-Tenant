import { BadRequestException, ConflictException, HttpException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { EmailInvalidoError, ErroDeDominio, IdMalFormatadoError, IpInvalidoError, NomeDePessoaInvalidoError } from "@saas/shared";
import {
    CredenciaisInvalidasError,
    SenhaForteInvalidaError,
    SenhaHashInvalidaError,
    SessaoExpiracaoInvalidaError,
    SessaoInvalidaError,
    SessaoNaoEncontradaError,
    UsuarioJaExistenteError,
} from "@saas/usuarios";

export class DomainToHttpMapper {
    static map(erro: ErroDeDominio): HttpException {
        switch (true) {
            case erro instanceof EmailInvalidoError:
            case erro instanceof IdMalFormatadoError:
            case erro instanceof IpInvalidoError:
            case erro instanceof NomeDePessoaInvalidoError:
            case erro instanceof SenhaForteInvalidaError:
                return new BadRequestException(erro.message);

            case erro instanceof CredenciaisInvalidasError:
            case erro instanceof SessaoInvalidaError:
                return new UnauthorizedException(erro.message);

            case erro instanceof SessaoNaoEncontradaError:
                return new NotFoundException(erro.message);

            case erro instanceof UsuarioJaExistenteError:
                return new ConflictException(erro.message);

            case erro instanceof SenhaHashInvalidaError:
            case erro instanceof SessaoExpiracaoInvalidaError:
                return new InternalServerErrorException(erro.message);

            default:
                return new InternalServerErrorException(erro.message);
        }
    }
}
