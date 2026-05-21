ALTER TABLE "Department"
ADD COLUMN "code" TEXT,
ADD COLUMN "headName" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "room" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "group" TEXT,
    "faculty" TEXT,
    "direction" TEXT,
    "studentNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
CREATE UNIQUE INDEX "StudentProfile_studentNumber_key" ON "StudentProfile"("studentNumber");

ALTER TABLE "StudentProfile"
ADD CONSTRAINT "StudentProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LibrarianProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibrarianProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LibrarianProfile_userId_key" ON "LibrarianProfile"("userId");

ALTER TABLE "LibrarianProfile"
ADD CONSTRAINT "LibrarianProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
