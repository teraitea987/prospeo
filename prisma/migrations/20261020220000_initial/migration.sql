-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ObservationKind" AS ENUM ('FACT', 'HYPOTHESIS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "siren" VARCHAR(9),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("workspaceId","id")
);

-- CreateTable
CREATE TABLE "Search" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "query" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("workspaceId","id")
);

-- CreateTable
CREATE TABLE "SearchResult" (
    "workspaceId" UUID NOT NULL,
    "searchId" UUID NOT NULL,
    "companyId" UUID NOT NULL,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("workspaceId","searchId","companyId")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "field" VARCHAR(100) NOT NULL,
    "value" VARCHAR(4000) NOT NULL,
    "kind" "ObservationKind" NOT NULL,
    "confidence" "Confidence" NOT NULL,
    "source" VARCHAR(200) NOT NULL,
    "sourceUrl" VARCHAR(2048) NOT NULL,
    "sourceRecordId" VARCHAR(200),
    "collectedAt" TIMESTAMPTZ(3) NOT NULL,
    "verifiedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("workspaceId","id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("workspaceId","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_workspaceId_siren_key" ON "Company"("workspaceId", "siren");

-- CreateIndex
CREATE INDEX "SearchResult_workspaceId_companyId_idx" ON "SearchResult"("workspaceId", "companyId");

-- CreateIndex
CREATE INDEX "Observation_workspaceId_companyId_collectedAt_idx" ON "Observation"("workspaceId", "companyId", "collectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_workspaceId_companyId_key" ON "Prospect"("workspaceId", "companyId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Search" ADD CONSTRAINT "Search_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_workspaceId_searchId_fkey" FOREIGN KEY ("workspaceId", "searchId") REFERENCES "Search"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_workspaceId_companyId_fkey" FOREIGN KEY ("workspaceId", "companyId") REFERENCES "Company"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_workspaceId_companyId_fkey" FOREIGN KEY ("workspaceId", "companyId") REFERENCES "Company"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_workspaceId_companyId_fkey" FOREIGN KEY ("workspaceId", "companyId") REFERENCES "Company"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invariants également imposés aux écritures ne passant pas par le repository.
ALTER TABLE "Company" ADD CONSTRAINT "Company_siren_format" CHECK ("siren" IS NULL OR "siren" ~ '^[0-9]{9}$');
ALTER TABLE "Company" ADD CONSTRAINT "Company_name_nonempty" CHECK (length(trim("name")) > 0);
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_verification_order" CHECK ("verifiedAt" IS NULL OR "verifiedAt" >= "collectedAt");
