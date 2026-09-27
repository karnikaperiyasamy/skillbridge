import { prisma } from "../../config/prisma";
import { RelevanceStatus } from "@prisma/client";

export async function submitEmployerValidation(data: {
  companyId: string;
  jobRole: string;
  skillName: string;
  relevanceStatus: RelevanceStatus;
  feedback?: string;
}) {
  return await prisma.employerValidation.create({
    data: {
      companyId: data.companyId,
      jobRole: data.jobRole,
      skillName: data.skillName,
      relevanceStatus: data.relevanceStatus,
      feedback: data.feedback,
    },
  });
}

export async function getEmployerValidations(params: {
  jobRole?: string;
  skillName?: string;
}) {
  const where: any = {};
  if (params.jobRole) where.jobRole = { equals: params.jobRole, mode: "insensitive" };
  if (params.skillName) where.skillName = { equals: params.skillName, mode: "insensitive" };

  return await prisma.employerValidation.findMany({
    where,
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });
}
