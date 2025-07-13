-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "local_base_dir" VARCHAR(512) NOT NULL,
    "remote_base_dir" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerCredential" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "hostname" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "passwordEncrypted" TEXT,
    "sshKeyPath" VARCHAR(512),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ServerCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBundle" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "calcTypeName" VARCHAR(50) NOT NULL,
    "theoryLevel" VARCHAR(50) NOT NULL,
    "basisSet" VARCHAR(50) NOT NULL,
    "solventModel" VARCHAR(50),
    "solventName" VARCHAR(50),
    "memGb" DECIMAL(5,2),
    "nprocShared" INTEGER,
    "additionalKeywords" TEXT,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "JobBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Molecule" (
    "id" UUID NOT NULL,
    "jobBundleId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "charge" SMALLINT NOT NULL,
    "multiplicity" SMALLINT NOT NULL,
    "atomCount" INTEGER NOT NULL,
    "localGjfPath" VARCHAR(512) NOT NULL,
    "inputXyzCoords" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Molecule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "moleculeId" UUID NOT NULL,
    "gaussianJobId" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL,
    "remoteJobDirPath" VARCHAR(512) NOT NULL,
    "startTime" TIMESTAMPTZ(6),
    "endTime" TIMESTAMPTZ(6),
    "errorMessage" TEXT,
    "lastLogUpdateAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSummaryResult" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "finalEnergyHartree" DECIMAL(18,10),
    "finalEnergyZpeHartree" DECIMAL(18,10),
    "finalEnergyHHartree" DECIMAL(18,10),
    "finalEnergyGHartree" DECIMAL(18,10),
    "homoEnergyEv" DECIMAL(10,5),
    "lumoEnergyEv" DECIMAL(10,5),
    "bandGapEv" DECIMAL(10,5),
    "lowestExcitationEnergyEv" DECIMAL(10,5),
    "lowestOscillatorStrength" DECIMAL(10,5),
    "extractedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "JobSummaryResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "JobSummaryResult_jobId_key" ON "JobSummaryResult"("jobId");

-- AddForeignKey
ALTER TABLE "ServerCredential" ADD CONSTRAINT "ServerCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBundle" ADD CONSTRAINT "JobBundle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Molecule" ADD CONSTRAINT "Molecule_jobBundleId_fkey" FOREIGN KEY ("jobBundleId") REFERENCES "JobBundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_moleculeId_fkey" FOREIGN KEY ("moleculeId") REFERENCES "Molecule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSummaryResult" ADD CONSTRAINT "JobSummaryResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
