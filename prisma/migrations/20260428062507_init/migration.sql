-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PLANNED', 'ON_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DayStatus" AS ENUM ('WORK', 'REST', 'TROUBLE', 'CUSTOM1', 'CUSTOM2', 'EMPTY');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "startDate" TIMESTAMP(3),
    "pic" TEXT,
    "vendor" TEXT,
    "vendorPhone" TEXT,
    "address" TEXT,
    "noSpr" TEXT,
    "correlatedDate" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'PLANNED',
    "remark" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL DEFAULT 2026,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySchedule" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dayStatus" "DayStatus" NOT NULL DEFAULT 'EMPTY',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "oldStatus" "Status",
    "newStatus" "Status" NOT NULL,
    "note" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_year_idx" ON "Project"("year");

-- CreateIndex
CREATE INDEX "Project_noSpr_idx" ON "Project"("noSpr");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "DailySchedule_taskId_idx" ON "DailySchedule"("taskId");

-- CreateIndex
CREATE INDEX "DailySchedule_date_idx" ON "DailySchedule"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySchedule_taskId_date_key" ON "DailySchedule"("taskId", "date");

-- CreateIndex
CREATE INDEX "Photo_projectId_idx" ON "Photo"("projectId");

-- CreateIndex
CREATE INDEX "StatusLog_projectId_idx" ON "StatusLog"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySchedule" ADD CONSTRAINT "DailySchedule_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
