-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "File" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "type" VARCHAR(64) NOT NULL,
    "original_name" VARCHAR(64) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);
