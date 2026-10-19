import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@nestjs/common';

import { ErroDeDominio, IpInvalidoError } from '@saas/shared';
import {
  CredenciaisInvalidasError,
  SessaoExpiracaoInvalidaError,
  SessaoInvalidaError,
  SessaoNaoEncontradaError,
  UsuarioNaoEncontradoError,
} from '@saas/usuarios';
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
} from '@saas/organizacoes';

import { DomainToHttpMapper } from '@shared/infrastructure/mappers/domain-to-http.mapper';

describe('DomainToHttpMapper', () => {
  it.each<[string, ErroDeDominio, HttpStatus]>([
    ['IpInvalidoError', new IpInvalidoError('x'), HttpStatus.BAD_REQUEST],
    ['CredenciaisInvalidasError', new CredenciaisInvalidasError(), HttpStatus.UNAUTHORIZED],
    ['SessaoInvalidaError', new SessaoInvalidaError(), HttpStatus.UNAUTHORIZED],
    ['SessaoNaoEncontradaError', new SessaoNaoEncontradaError(), HttpStatus.NOT_FOUND],
    ['SessaoExpiracaoInvalidaError', new SessaoExpiracaoInvalidaError(), HttpStatus.INTERNAL_SERVER_ERROR],
    ['UsuarioNaoEncontradoError', new UsuarioNaoEncontradoError(), HttpStatus.NOT_FOUND],
    ['NomeDaOrganizacaoInvalidoError', new NomeDaOrganizacaoInvalidoError('curto'), HttpStatus.BAD_REQUEST],
    ['SlugInvalidoError', new SlugInvalidoError('!', 'inválido'), HttpStatus.BAD_REQUEST],
    ['CargoNaoPermitidoError', new CargoNaoPermitidoError('PROPRIETARIO', 'motivo'), HttpStatus.BAD_REQUEST],
    ['PermissaoInsuficienteError', new PermissaoInsuficienteError(), HttpStatus.FORBIDDEN],
    ['OrganizacaoNaoEncontradaError', new OrganizacaoNaoEncontradaError(), HttpStatus.NOT_FOUND],
    ['MembroNaoEncontradoError', new MembroNaoEncontradoError(), HttpStatus.NOT_FOUND],
    ['OrganizacaoJaExistenteError', new OrganizacaoJaExistenteError('empresa'), HttpStatus.CONFLICT],
    ['VinculoJaExistenteError', new VinculoJaExistenteError(), HttpStatus.CONFLICT],
    ['UltimoProprietarioError', new UltimoProprietarioError(), HttpStatus.CONFLICT],
  ])('deve mapear %s para o status correto', (_, erro, status) => {
    const excecao = DomainToHttpMapper.map(erro);

    expect(excecao.getStatus()).toBe(status);
    expect(excecao.message).toBe(erro.message);
  });
});
