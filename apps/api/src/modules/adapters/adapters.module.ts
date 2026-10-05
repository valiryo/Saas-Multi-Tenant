import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@shared/infrastructure/persistence/prisma/prisma.module';
import { PrismaVinculoEmpregaticioAdapter } from '@shared/infrastructure/persistence/prisma/prisma-vinculo-empregaticio.adapter';
import { REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN } from '@shared/shared.token';

import { BcryptServicoCriptografia } from '@users/infrastructure/services/bcrypt-servico-criptografia';
import { JwtServicoTokenAutenticacao } from '@users/infrastructure/services/jwt-token-servico-autenticacao';
import { PrismaUsuarioAdapter } from '@users/infrastructure/persistence/prisma/prisma-usuario.adapter';
import { PrismaSessaoAdapter } from '@users/infrastructure/persistence/prisma/prisma-sessao.adapter';

import {
  REPOSITORIO_USUARIO_TOKEN,
  REPOSITORIO_SESSAO_TOKEN,
  SERVICO_CRIPTOGRAFIA_TOKEN,
  SERVICO_AUTENTICACAO_TOKEN,
} from '@users/usuario.tokens';

import { apiConfig } from 'src/config/api.config';

import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [
    PrismaModule,

    ConfigModule.forFeature(apiConfig),

    JwtModule.register({}),

    DatabaseModule,
  ],

  providers: [
    {
      provide: REPOSITORIO_USUARIO_TOKEN,
      useClass: PrismaUsuarioAdapter,
    },

    {
      provide: REPOSITORIO_SESSAO_TOKEN,
      useClass: PrismaSessaoAdapter,
    },

    {
      provide: REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN,
      useClass: PrismaVinculoEmpregaticioAdapter,
    },

    {
      provide: SERVICO_CRIPTOGRAFIA_TOKEN,
      useClass: BcryptServicoCriptografia,
    },

    {
      provide: SERVICO_AUTENTICACAO_TOKEN,
      useClass: JwtServicoTokenAutenticacao,
    },
  ],

  exports: [
    REPOSITORIO_USUARIO_TOKEN,
    REPOSITORIO_SESSAO_TOKEN,
    REPOSITORIO_VINCULO_EMPREGATICIO_TOKEN,
    SERVICO_CRIPTOGRAFIA_TOKEN,
    SERVICO_AUTENTICACAO_TOKEN,
    JwtModule,
  ],
})
export class AdaptersModule {}
