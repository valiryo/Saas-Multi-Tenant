import type { PrismaClient } from "database";

import { Email } from "@shared/domain/value-objects/email";

import { Usuario } from "@users/domain/entities/usuario.entidade";
import { IRepositorioUsuario } from "@users/domain/repositories/usuario.repositorio";

import {
  PrismaUsuarioMapper,
  type PrismaUsuarioSchema,
} from "../mappers/prisma-usuario.mapper";

export class PrismaUsuarioAdapter
  implements IRepositorioUsuario
{
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  public async buscarPorEmail(
    email: Email,
  ): Promise<Usuario | null> {
    const dadosPrisma =
      await this.prisma.usuario.findUnique({
        where: {
          email: email.valor,
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(
      dadosPrisma,
    );
  }

  public async salvar(
    usuario: Usuario,
  ): Promise<Usuario> {
    const dadosPersistencia =
      PrismaUsuarioMapper
        .paraPersistencia(usuario);

    const dadosPrisma =
      await this.prisma.usuario.upsert({
        where: {
          id: usuario.id.valor,
        },

        create: {
          id: dadosPersistencia.id,
          nome: dadosPersistencia.nome,
          email: dadosPersistencia.email,
          senhaHash:
            dadosPersistencia.senhaHash,
        },

        update: {
          nome: dadosPersistencia.nome,
          email: dadosPersistencia.email,
          senhaHash:
            dadosPersistencia.senhaHash,
        },
      });

    return this.converterParaDominio(
      dadosPrisma,
    );
  }

  private converterParaDominio(
    dadosPrisma: PrismaUsuarioSchema,
  ): Usuario {
    const resultado =
      PrismaUsuarioMapper
        .paraDominio(dadosPrisma);

    if (resultado.isFalha) {
      throw resultado.falha;
    }

    return resultado.resultado;
  }
}