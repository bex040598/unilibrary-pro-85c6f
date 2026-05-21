import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/auth/password";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function createSamplePdf(filepath: string, title: string) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 90 >>
stream
BT
/F1 24 Tf
72 760 Td
(${title.replace(/[()]/g, "")}) Tj
0 -40 Td
/F1 14 Tf
(ATMU Smart UniLibrary sample resource file.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000390 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
460
%%EOF`;

  await writeFile(filepath, content, "utf8");
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    throw new Error("Seed is disabled in production unless ALLOW_PRODUCTION_SEED=true");
  }

  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? path.join("storage", "uploads"));
  await mkdir(uploadDir, { recursive: true });

  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.securityLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.searchLog.deleteMany();
  await prisma.downloadLog.deleteMany();
  await prisma.viewLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.renewalRequest.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.seatReservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.readingRoom.deleteMany();
  await prisma.bookCopy.deleteMany();
  await prisma.resourceAuthor.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.librarianProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.systemSetting.deleteMany();

  const faculties = await Promise.all(
    [
      ["Axborot texnologiyalari", "Informatsionnye tekhnologii", "Information Technologies", "it-faculty"],
      ["Iqtisodiyot va menejment", "Ekonomika i menedzhment", "Economics and Management", "economics-management"],
      ["Muhandislik", "Inzheneriya", "Engineering", "engineering"]
    ].map(([nameUz, nameRu, nameEn, slug]) =>
      prisma.faculty.create({
        data: { nameUz, nameRu, nameEn, slug }
      })
    )
  );

  const departmentSpecs = [
    {
      facultyId: faculties[0].id,
      nameUz: "Axborot texnologiyalari",
      nameRu: "Informatsionnye tekhnologii",
      nameEn: "Information Technologies",
      slug: "axborot-texnologiyalari",
      code: "AT-01",
      headName: "Prof. Azizbek Karimov",
      email: "it.department@atmu.uz",
      phone: "+998 71 200 00 11",
      room: "A-301",
      description: "Universitetning amaliy IT, dasturlash va axborot tizimlari yonalishlari boyicha tayanch kafedrasi."
    },
    {
      facultyId: faculties[0].id,
      nameUz: "Dasturiy injiniring",
      nameRu: "Programmnaya injeneriya",
      nameEn: "Software Engineering",
      slug: "dasturiy-injiniring",
      code: "SE-02",
      headName: "Dots. Nodir Tursunov",
      email: "se.department@atmu.uz",
      phone: "+998 71 200 00 12",
      room: "A-305",
      description: "Full-stack development, software architecture va enterprise platformalar boyicha akademik markaz."
    },
    {
      facultyId: faculties[1].id,
      nameUz: "Raqamli iqtisodiyot",
      nameRu: "Tsifrovaya ekonomika",
      nameEn: "Digital Economy",
      slug: "raqamli-iqtisodiyot",
      code: "DE-03",
      headName: "Prof. Dilnoza Ergasheva",
      email: "de.department@atmu.uz",
      phone: "+998 71 200 00 13",
      room: "B-201",
      description: "Raqamli transformatsiya, iqtisodiy tahlil va data-driven boshqaruv boyicha resurslar markazi."
    },
    {
      facultyId: faculties[0].id,
      nameUz: "Sun'iy intellekt va ma'lumotlar tahlili",
      nameRu: "Iskusstvennyy intellekt i analitika dannykh",
      nameEn: "Artificial Intelligence and Data Analytics",
      slug: "suniy-intellekt-va-malumotlar-tahlili",
      code: "AI-04",
      headName: "Prof. Bahrom Raxmonov",
      email: "ai.department@atmu.uz",
      phone: "+998 71 200 00 14",
      room: "A-401",
      description: "Machine learning, suniy intellekt va malumotlar tahlili boyicha zamonaviy oquv-uslubiy platforma."
    },
    {
      facultyId: faculties[2].id,
      nameUz: "Kompyuter tizimlari va tarmoqlari",
      nameRu: "Kompyuternye sistemy i seti",
      nameEn: "Computer Systems and Networks",
      slug: "kompyuter-tizimlari-va-tarmoqlari",
      code: "CN-05",
      headName: "Dots. Rustam Xasanov",
      email: "net.department@atmu.uz",
      phone: "+998 71 200 00 15",
      room: "C-112",
      description: "Kompyuter tarmoqlari, server infratuzilmasi va amaliy laboratoriyalar boyicha xizmat qiluvchi kafedra."
    },
    {
      facultyId: faculties[1].id,
      nameUz: "Menejment",
      nameRu: "Menedzhment",
      nameEn: "Management",
      slug: "management",
      code: "MG-06",
      headName: "Dots. Maftuna Qosimova",
      email: "management@atmu.uz",
      phone: "+998 71 200 00 16",
      room: "B-210",
      description: "Boshqaruv, liderlik va tashkilot samaradorligi boyicha metodik resurslar markazi."
    },
    {
      facultyId: faculties[2].id,
      nameUz: "Kiberxavfsizlik",
      nameRu: "Kiberbezopasnost",
      nameEn: "Cybersecurity",
      slug: "cybersecurity",
      code: "CS-07",
      headName: "Prof. Komil Ibrohimov",
      email: "cyber@atmu.uz",
      phone: "+998 71 200 00 17",
      room: "C-118",
      description: "Axborot xavfsizligi, tarmoq himoyasi va audit boyicha talim resurslarini yuritadi."
    }
  ] as const;

  const departments = await Promise.all(
    departmentSpecs.map((item) =>
      prisma.department.create({
        data: item
      })
    )
  );

  const categories = await Promise.all(
    [
      "Textbooks",
      "Study Guides",
      "Monographs",
      "Articles",
      "Dissertations",
      "Methodical Guides",
      "Lab Work",
      "Presentations",
      "Videos",
      "Research Methods",
      "Programming",
      "Management"
    ].map((name, index) =>
      prisma.category.create({
        data: {
          nameUz: name,
          nameRu: name,
          nameEn: name,
          slug: slugify(name),
          icon: ["book", "file", "video"][index % 3]
        }
      })
    )
  );

  const authors = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      prisma.author.create({
        data: {
          fullName: `Professor ${index + 1}`,
          bio: `ATMU academic author #${index + 1}`
        }
      })
    )
  );

  const [adminHash, librarianHash, moderatorHash, teacherHash, studentHash, departmentHash] = await Promise.all([
    hashPassword("Admin12345!"),
    hashPassword("Librarian12345!"),
    hashPassword("Moderator12345!"),
    hashPassword("Teacher12345!"),
    hashPassword("Student12345!"),
    hashPassword("Department12345!")
  ]);

  const admin = await prisma.user.create({
    data: {
      fullName: "ATMU Administrator",
      email: "admin@atmu.uz",
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      facultyId: faculties[0].id,
      departmentId: departments[0].id
    }
  });

  const librarians = await Promise.all(
    ["librarian@atmu.uz", "librarian2@atmu.uz"].map((email, index) =>
      prisma.user.create({
        data: {
          fullName: `Librarian ${index + 1}`,
          email,
          passwordHash: librarianHash,
          role: "LIBRARIAN",
          status: "ACTIVE",
          facultyId: faculties[0].id,
          departmentId: departments[index].id,
          employeeId: `LIB-${index + 1}`
        }
      })
    )
  );

  await prisma.librarianProfile.createMany({
    data: librarians.map((librarian, index) => ({
      userId: librarian.id,
      position: index === 0 ? "Bosh kutubxonachi" : "Kutubxonachi",
      department: departments[index]?.nameUz ?? departments[0].nameUz,
      phone: `+998 90 500 00 ${String(index + 1).padStart(2, "0")}`
    }))
  });

  const moderators = await Promise.all(
    ["moderator@atmu.uz", "moderator2@atmu.uz"].map((email, index) =>
      prisma.user.create({
        data: {
          fullName: `Moderator ${index + 1}`,
          email,
          passwordHash: moderatorHash,
          role: "MODERATOR",
          status: "ACTIVE",
          facultyId: faculties[0].id,
          departmentId: departments[index].id,
          employeeId: `MOD-${index + 1}`
        }
      })
    )
  );

  const teachers = await Promise.all(
    Array.from({ length: 5 }, (_, index) =>
      prisma.user.create({
        data: {
          fullName: `Teacher ${index + 1}`,
          email: index === 0 ? "teacher@atmu.uz" : `teacher${index + 1}@atmu.uz`,
          passwordHash: teacherHash,
          role: "TEACHER",
          status: "ACTIVE",
          facultyId: faculties[index % faculties.length].id,
          departmentId: departments[index % departments.length].id,
          employeeId: `TCH-${index + 1}`
        }
      })
    )
  );

  await prisma.user.createMany({
    data: Array.from({ length: 2 }, (_, index) => ({
      fullName: `Department Head ${index + 1}`,
      email: index === 0 ? "department@atmu.uz" : `department${index + 2}@atmu.uz`,
      passwordHash: departmentHash,
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      facultyId: faculties[index].id,
      departmentId: departments[index].id,
      employeeId: `DPT-${index + 1}`
    }))
  });

  const students = await Promise.all(
    Array.from({ length: 10 }, (_, index) =>
      prisma.user.create({
        data: {
          fullName: `Student ${index + 1}`,
          email: index === 0 ? "student@atmu.uz" : `student${index + 1}@atmu.uz`,
          passwordHash: studentHash,
          role: "STUDENT",
          status: "ACTIVE",
          facultyId: faculties[index % faculties.length].id,
          departmentId: departments[index % departments.length].id,
          studentId: `STD-${1000 + index + 1}`
        }
      })
    )
  );

  await prisma.studentProfile.createMany({
    data: students.map((student, index) => ({
      userId: student.id,
      group: `SE-${24 + (index % 3)}-${(index % 2) + 1}`,
      faculty: faculties[index % faculties.length].nameUz,
      direction: departments[index % departments.length].nameUz,
      studentNumber: `ATMU-${2026}-${1000 + index}`
    }))
  });

  const resources = [];

  for (let index = 0; index < 30; index += 1) {
    const title = `ATMU Resource ${index + 1}`;
    const filepath = path.join(uploadDir, `resource-${index + 1}.pdf`);
    await createSamplePdf(filepath, title);
    const owner = teachers[index % teachers.length];
    const department = departments[index % departments.length];
    const faculty = faculties[index % faculties.length];
    const status =
      index < 20 ? "APPROVED" : index < 24 ? "PENDING_REVIEW" : index < 27 ? "DRAFT" : "NEEDS_REVISION";

    const resource = await prisma.resource.create({
      data: {
        title,
        slug: `${slugify(title)}-${index + 1}`,
        description: `${title} boyicha batafsil tavsif.`,
        abstract: `${title} uchun ilmiy abstrakt.`,
        keywords: "atmu, library, resource, university",
        categoryId: categories[index % categories.length].id,
        facultyId: faculty.id,
        departmentId: department.id,
        language: ["UZ", "RU", "EN"][index % 3],
        publicationYear: 2015 + (index % 10),
        publisher: "ATMU Press",
        isbn: `978-9943-${1000 + index}`,
        udk: `004.${index}`,
        bbk: `32.${index}`,
        pages: 100 + index,
        resourceType: ["TEXTBOOK", "ARTICLE", "STUDY_GUIDE", "MONOGRAPH"][index % 4],
        fileUrl: filepath,
        fileSize: 1024 + index,
        fileFormat: "PDF",
        fileChecksum: `checksum-${index + 1}`,
        accessType: ["PUBLIC", "AUTH_REQUIRED", "STAFF_ONLY"][index % 3],
        status,
        viewCount: 25 + index * 3,
        downloadCount: 10 + index * 2,
        uploadedById: owner.id,
        approvedById: status === "APPROVED" ? moderators[index % moderators.length].id : null,
        approvedAt: status === "APPROVED" ? new Date() : null,
        rejectionReason: status === "NEEDS_REVISION" ? "Metadata incomplete" : null,
        authors: {
          create: [
            { authorId: authors[index % authors.length].id },
            { authorId: authors[(index + 3) % authors.length].id }
          ]
        }
      }
    });

    resources.push(resource);
  }

  const approvedResources = resources.filter((resource) => resource.status === "APPROVED");

  const bookCopies = await Promise.all(
    approvedResources.slice(0, 20).map((resource, index) =>
      prisma.bookCopy.create({
        data: {
          resourceId: resource.id,
          inventoryNumber: `INV-${2000 + index}`,
          barcode: `BC-${3000 + index}`,
          qrCode: `QR-${3000 + index}`,
          shelfLocation: `Shelf ${index % 5 + 1}-${index % 4 + 1}`,
          status: "AVAILABLE"
        }
      })
    )
  );

  const readingRoomSpecs: [string, string, number, string, string][] = [
    ["Main Reading Hall", "1-floor", 25, "08:00", "20:00"],
    ["Research Reading Hall", "2-floor", 25, "09:00", "18:00"]
  ];

  const readingRooms = await Promise.all(
    readingRoomSpecs.map(([name, floor, capacity, openingTime, closingTime]) =>
      prisma.readingRoom.create({
        data: {
          name,
          floor,
          capacity,
          openingTime,
          closingTime,
          status: "ACTIVE"
        }
      })
    )
  );

  const seats = [];
  for (const [roomIndex, room] of readingRooms.entries()) {
    for (let seatIndex = 0; seatIndex < 25; seatIndex += 1) {
      const seat = await prisma.seat.create({
        data: {
          roomId: room.id,
          seatNumber: `${roomIndex + 1}-${seatIndex + 1}`,
          hasPowerSocket: seatIndex % 2 === 0,
          hasComputer: seatIndex % 5 === 0,
          status: "AVAILABLE"
        }
      });
      seats.push(seat);
    }
  }

  for (let index = 0; index < 10; index += 1) {
    const copy = bookCopies[index];
    await prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: "RESERVED" }
    });

    await prisma.reservation.create({
      data: {
        userId: students[index % students.length].id,
        resourceId: copy.resourceId,
        copyId: copy.id,
        pickupDate: new Date(Date.now() + index * 1000 * 60 * 60 * 24),
        pickupDeadline: new Date(Date.now() + (index + 1) * 1000 * 60 * 60 * 24),
        status: index < 4 ? "APPROVED" : index < 7 ? "PENDING" : "REJECTED",
        qrCode: `RSV-${index + 1}`
      }
    });
  }

  for (let index = 0; index < 10; index += 1) {
    const copy = bookCopies[index + 10];
    await prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: index < 7 ? "BORROWED" : "AVAILABLE" }
    });
    const status = index < 3 ? "ACTIVE" : index < 6 ? "OVERDUE" : "RETURNED";
    await prisma.loan.create({
      data: {
        userId: students[(index + 2) % students.length].id,
        resourceId: copy.resourceId,
        copyId: copy.id,
        issuedAt: new Date(Date.now() - index * 1000 * 60 * 60 * 24),
        dueAt: new Date(Date.now() + (index < 6 ? -1 : 5) * 1000 * 60 * 60 * 24),
        returnedAt: status === "RETURNED" ? new Date() : null,
        status,
        renewalCount: index % 2,
        fineAmount: status === "OVERDUE" ? 15000 : 0
      }
    });
  }

  for (let index = 0; index < 20; index += 1) {
    await prisma.review.create({
      data: {
        userId: students[index % students.length].id,
        resourceId: approvedResources[index % approvedResources.length].id,
        rating: (index % 5) + 1,
        comment: `Review ${index + 1} for resource`,
        status: "APPROVED"
      }
    });
  }

  for (const resource of approvedResources) {
    const aggregate = await prisma.review.aggregate({
      where: { resourceId: resource.id, status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        ratingAvg: aggregate._avg.rating ?? 0,
        ratingCount: aggregate._count.rating
      }
    });
  }

  for (let index = 0; index < 50; index += 1) {
    await prisma.viewLog.create({
      data: {
        userId: students[index % students.length].id,
        resourceId: approvedResources[index % approvedResources.length].id,
        ipAddress: `10.0.0.${index + 1}`,
        userAgent: "seed-agent"
      }
    });
  }

  for (let index = 0; index < 30; index += 1) {
    await prisma.downloadLog.create({
      data: {
        userId: students[index % students.length].id,
        resourceId: approvedResources[index % approvedResources.length].id,
        ipAddress: `10.0.1.${index + 1}`,
        userAgent: "seed-agent"
      }
    });
  }

  for (let index = 0; index < 20; index += 1) {
    await prisma.searchLog.create({
      data: {
        userId: students[index % students.length].id,
        query: `query ${index + 1}`,
        filters: JSON.stringify({ language: "UZ" }),
        resultCount: 10 + index
      }
    });
  }

  for (let index = 0; index < 20; index += 1) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: `SEED_ACTION_${index + 1}`,
        entity: "Seed",
        entityId: `seed-${index + 1}`,
        oldValue: JSON.stringify({ before: null }),
        newValue: JSON.stringify({ after: index + 1 }),
        ipAddress: "127.0.0.1",
        userAgent: "seed"
      }
    });
  }

  for (let index = 0; index < 10; index += 1) {
    await prisma.securityLog.create({
      data: {
        userId: admin.id,
        event: index % 2 === 0 ? "LOGIN_FAILED" : "LOGIN_SUCCESS",
        severity: index % 2 === 0 ? "MEDIUM" : "LOW",
        ipAddress: "127.0.0.1",
        userAgent: "seed",
        metadata: JSON.stringify({ attempt: index + 1 })
      }
    });
  }

  for (let index = 0; index < 10; index += 1) {
    await prisma.notification.create({
      data: {
        userId: students[index % students.length].id,
        type: "SYSTEM",
        title: `Notification ${index + 1}`,
        message: "ATMU Smart UniLibrary development notification"
      }
    });
  }

  for (let index = 0; index < 6; index += 1) {
    await prisma.favorite.create({
      data: {
        userId: students[index % students.length].id,
        resourceId: approvedResources[index].id
      }
    });
  }

  for (let index = 0; index < 8; index += 1) {
    await prisma.seatReservation.create({
      data: {
        userId: students[index % students.length].id,
        roomId: readingRooms[index % readingRooms.length].id,
        seatId: seats[index].id,
        startTime: new Date(Date.now() + index * 1000 * 60 * 60),
        endTime: new Date(Date.now() + (index + 2) * 1000 * 60 * 60),
        status: index < 4 ? "BOOKED" : "CHECKED_IN",
        qrCode: `SEAT-${index + 1}`,
        checkInAt: index >= 4 ? new Date() : null
      }
    });
  }

  await prisma.systemSetting.createMany({
    data: [
      { key: "maintenanceMode", value: JSON.stringify(false) },
      { key: "libraryBrand", value: JSON.stringify("ATMU Smart UniLibrary Enterprise") }
    ]
  });

  await prisma.announcement.create({
    data: {
      title: "ATMU Smart UniLibrary ishga tushdi",
      content: "Yangi enterprise kutubxona platformasi development rejimida tayyorlandi.",
      status: "PUBLISHED"
    }
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
