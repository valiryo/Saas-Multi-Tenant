import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@nestjs/common';

import { ErroDeDominio, IpInvalidoError } from '@saas/shared';
import {
  CredenciaisInvalidasError,
  SessaoExpiracaoInvalidaError,
  SessaoInvalidaError,
  SessaoNaoEncontradaError,
} from '@saas/usuarios';

import { DomainToHttpMapper } from '@shared/infrastructure/mappers/domain-to-http.mapper';

describe('DomainToHttpMapper', () => {
  it.each<[string, ErroDeDominio, HttpStatus]>([
    ['IpInvalidoError', new IpInvalidoError('x'), HttpStatus.BAD_REQUEST],
    ['CredenciaisInvalidasError', new CredenciaisInvalidasError(), HttpStatus.UNAUTHORIZED],
    ['SessaoInvalidaError', new SessaoInvalidaError(), HttpStatus.UNAUTHORIZED],
    ['SessaoNaoEncontradaError', new SessaoNaoEncontradaError(), HttpStatus.NOT_FOUND],
    ['SessaoExpiracaoInvalidaError', new SessaoExpiracaoInvalidaError(), HttpStatus.INTERNAL_SERVER_ERROR],
  ])('deve mapear %s para o status correto', (_, erro, status) => {
    const excecao = DomainToHttpMapper.map(erro);

    expect(excecao.getStatus()).toBe(status);
    expect(excecao.message).toBe(erro.message);
  });
});
