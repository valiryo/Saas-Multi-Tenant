/*
  Warnings:

  - You are about to drop the `VinculoOrganizacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoCargo" AS ENUM ('ADMINISTRADOR', 'FUNCIONARIO');

-- DropForeignKey
ALTER TABLE "VinculoOrganizacao" DROP CONSTRAINT "VinculoOrganizacao_organizacaoId_fkey";

-- DropForeignKey
ALTER TABLE "VinculoOrganizacao" DROP CONSTRAINT "VinculoOrganizacao_usuarioId_fkey";

-- DropTable
DROP TABLE "VinculoOrganizacao";

-- CreateTable
CREATE TABLE "VinculoEmpregaticio" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "cargo" "TipoCargo" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VinculoEmpregaticio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoVinculoEmpregaticio" (
    "id" TEXT NOT NULL,
    "vinculoId" TEXT NOT NULL,
    "cargo" "TipoCargo" NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "alteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoVinculoEmpregaticio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VinculoEmpregaticio_organizacaoId_idx" ON "VinculoEmpregaticio"("organizacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "VinculoEmpregaticio_usuarioId_organizacaoId_key" ON "VinculoEmpregaticio"("usuarioId", "organizacaoId");

-- CreateIndex
CREATE INDEX "HistoricoVinculoEmpregaticio_vinculoId_idx" ON "HistoricoVinculoEmpregaticio"("vinculoId");

-- CreateIndex
CREATE INDEX "HistoricoVinculoEmpregaticio_vinculoId_alteradoEm_idx" ON "HistoricoVinculoEmpregaticio"("vinculoId", "alteradoEm");

-- AddForeignKey
ALTER TABLE "VinculoEmpregaticio" ADD CONSTRAINT "VinculoEmpregaticio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoEmpregaticio" ADD CONSTRAINT "VinculoEmpregaticio_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoVinculoEmpregaticio" ADD CONSTRAINT "HistoricoVinculoEmpregaticio_vinculoId_fkey" FOREIGN KEY ("vinculoId") REFERENCES "VinculoEmpregaticio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
