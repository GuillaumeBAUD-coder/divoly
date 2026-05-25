-- CreateTable
CREATE TABLE "AnswerRequest" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "AnswerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnswerRequest_normalizedQuery_key" ON "AnswerRequest"("normalizedQuery");

-- CreateIndex
CREATE INDEX "AnswerRequest_status_requestCount_idx" ON "AnswerRequest"("status", "requestCount" DESC);

-- CreateIndex
CREATE INDEX "AnswerRequest_createdAt_idx" ON "AnswerRequest"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AnswerRequest" ADD CONSTRAINT "AnswerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
