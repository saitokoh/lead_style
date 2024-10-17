-- CreateTable
CREATE TABLE "LeadStyles" (
    "id" SERIAL NOT NULL,
    "a" INTEGER NOT NULL,
    "b" INTEGER NOT NULL,
    "c" INTEGER NOT NULL,
    "d" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "LeadStyles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadStyles_sessionId_key" ON "LeadStyles"("sessionId");
