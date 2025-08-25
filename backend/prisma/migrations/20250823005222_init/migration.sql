-- CreateTable
CREATE TABLE "public"."vital_records" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "heart_rate" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vital_records_worker_id_idx" ON "public"."vital_records"("worker_id");

-- CreateIndex
CREATE INDEX "vital_records_timestamp_idx" ON "public"."vital_records"("timestamp");

-- CreateIndex
CREATE INDEX "vital_records_worker_id_timestamp_idx" ON "public"."vital_records"("worker_id", "timestamp");
