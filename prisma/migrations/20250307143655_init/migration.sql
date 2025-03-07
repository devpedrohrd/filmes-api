-- CreateTable
CREATE TABLE "Filmes" (
    "id" SERIAL NOT NULL,
    "original_title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vote_average" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Filmes_pkey" PRIMARY KEY ("id")
);
