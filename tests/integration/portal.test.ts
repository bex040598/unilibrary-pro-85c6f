import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { getDepartmentBySlug, listDepartments } from "@/server/services/department-service";
import { getLibrarianDashboard } from "@/server/services/librarian-dashboard-service";
import { getStudentDashboard } from "@/server/services/student-dashboard-service";

describe("portal data services", () => {
  it("loads seeded departments from database", async () => {
    const result = await listDepartments({ page: 1, limit: 10, q: "Dasturiy", includeInactive: "false" });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.nameUz).toContain("Dasturiy");
  });

  it("loads department detail with resources", async () => {
    const department = await prisma.department.findFirstOrThrow({
      where: {
        resources: {
          some: {
            status: "APPROVED"
          }
        }
      }
    });

    const detail = await getDepartmentBySlug(department.slug);
    expect(detail.slug).toBe(department.slug);
    expect(detail.resources.length).toBeGreaterThan(0);
  });

  it("builds student and librarian dashboard payloads", async () => {
    const [student, librarian] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } }),
      prisma.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } })
    ]);

    const studentDashboard = await getStudentDashboard(student.id);
    const librarianDashboard = await getLibrarianDashboard(librarian.id);

    expect(studentDashboard.profile.email).toBe(student.email);
    expect(studentDashboard.profile.studentNumber).toBeTruthy();
    expect(Array.isArray(studentDashboard.notifications)).toBe(true);

    expect(librarianDashboard.profile.email).toBe(librarian.email);
    expect(librarianDashboard.profile.position).toBeTruthy();
    expect(Array.isArray(librarianDashboard.reservations)).toBe(true);
  });
});
