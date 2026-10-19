import { BadRequestException, ConflictException, ForbiddenException, HttpException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { EmailInvalidoError, ErroDeDominio, IdMalFormatadoError, IpInvalidoError, NomeDePessoaInvalidoError } from "@saas/shared";
import {
    CredenciaisInvalidasError,
    SenhaForteInvalidaError,
    SenhaHashInvalidaError,
    SessaoExpiracaoInvalidaError,
    SessaoInvalidaError,
    SessaoNaoEncontradaError,
    UsuarioJaExistenteError,
    UsuarioNaoEncontradoError,
} from "@saas/usuarios";
import {
    CargoNaoPermitidoError,
    MembroNaoEncontradoError,
    NomeDaOrganizacaoInvalidoError,
    OrganizacaoJaExistenteError,
    OrganizacaoNaoEncontradaError,
    PermissaoInsuficienteError,
    SlugInvalidoError,
    UltimoProprietarioError,
    VinculoJaExistenteError,
} from "@saas/organizacoes";

export class DomainToHttpMapper {
    static map(erro: ErroDeDominio): HttpException {
        switch (true) {
            case erro instanceof EmailInvalidoError:
            case erro instanceof IdMalFormatadoError:
            case erro instanceof IpInvalidoError:
            case erro instanceof NomeDePessoaInvalidoError:
            case erro instanceof SenhaForteInvalidaError:
            case erro instanceof NomeDaOrganizacaoInvalidoError:
            case erro instanceof SlugInvalidoError:
            case erro instanceof CargoNaoPermitidoError:
                return new BadRequestException(erro.message);

            case erro instanceof CredenciaisInvalidasError:
            case erro instanceof SessaoInvalidaError:
                return new UnauthorizedException(erro.message);

            case erro instanceof PermissaoInsuficienteError:
                return new ForbiddenException(erro.message);

            case erro instanceof SessaoNaoEncontradaError:
            case erro instanceof UsuarioNaoEncontradoError:
            case erro instanceof OrganizacaoNaoEncontradaError:
            case erro instanceof MembroNaoEncontradoError:
                return new NotFoundException(erro.message);

            case erro instanceof UsuarioJaExistenteError:
            case erro instanceof OrganizacaoJaExistenteError:
            case erro instanceof VinculoJaExistenteError:
            case erro instanceof UltimoProprietarioError:
                return new ConflictException(erro.message);

            case erro instanceof SenhaHashInvalidaError:
            case erro instanceof SessaoExpiracaoInvalidaError:
                return new InternalServerErrorException(erro.message);

            default:
                return new InternalServerErrorException(erro.message);
        }
    }
}
