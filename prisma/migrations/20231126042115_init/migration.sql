-- CreateTable
CREATE TABLE "batch_submissions" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "license" INTEGER,
    "comment" TEXT,
    "serial_number" TEXT NOT NULL,

    CONSTRAINT "batch_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "batch_submissions_serial_number_key" ON "batch_submissions"("serial_number");
