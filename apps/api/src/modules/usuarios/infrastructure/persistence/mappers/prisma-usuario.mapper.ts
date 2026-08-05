import type { Prisma } from "database";

import { Email } from '@shared/domain/value-objects/email';
import { Id } from '@shared/domain/value-objects/id';
import { NomeDePessoa } from '@shared/domain/value-objects/nome-de-pessoa';
import { Result } from '@shared/domain/value-objects/result';

import { Usuario } from '@users/domain/entities/usuario.entidade';
import { SenhaHash } from '@users/domain/value-objects/senhaHash';

const usuarioComVinculos = {
  include: {
    vinculos: {
      select: {
        organizacaoId: true,
      },
    },
  },
} satisfies Prisma.UsuarioDefaultArgs;

export type PrismaUsuarioSchema =
  Prisma.UsuarioGetPayload<typeof usuarioComVinculos>;

export class PrismaUsuarioMapper {
  public static paraDominio(
    dadosPrisma: PrismaUsuarioSchema,
  ): Result<Usuario> {
    const id = Id.criar(dadosPrisma.id);

    if (id.isFalha) {
      return Result.falhar(id.falha);
    }

    const email = Email.criar(dadosPrisma.email);

    if (email.isFalha) {
      return Result.falhar(email.falha);
    }

    const senhaHash = SenhaHash.criar(
      dadosPrisma.senhaHash,
    );

    const nome = NomeDePessoa.criar(dadosPrisma.nome);

    if (nome.isFalha) {
      return Result.falhar(nome.falha);
    }

    const organizacaoIds: Id[] = [];

    for (const vinculo of dadosPrisma.vinculos) {
      const organizacaoId = Id.criar(
        vinculo.organizacaoId,
      );

      if (organizacaoId.isFalha) {
        return Result.falhar(organizacaoId.falha);
      }

      organizacaoIds.push(organizacaoId.resultado);
    }

    return Usuario.criar({
      id: id.resultado,
      email: email.resultado,
      senhaHash: senhaHash,
      nome: nome.resultado,
      organizacaoIds,
    });
  }

  public static paraPersistencia(
    usuario: Usuario,
  ): Prisma.UsuarioUncheckedCreateInput {
    return {
      id: usuario.id.valor,
      nome: usuario.nome.nomeCompleto,
      email: usuario.email.valor,
      senhaHash: usuario.senhaHash.valor,
    };
  }
}