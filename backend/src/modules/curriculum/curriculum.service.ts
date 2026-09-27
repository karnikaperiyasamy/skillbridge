import { prisma } from "../../config/prisma";
import { normalizeSkill } from "../labourMarket/labourMarket.normalizer";
import { CourseHealthStatus, AlignmentStatus } from "@prisma/client";

export interface CurriculumAnalysisInput {
  collegeId?: string;
  department?: string;
  targetJobRole: string;
  state?: string;
  district?: string;
  taughtSkills: string[];
}

export async function analyzeCurriculumAlignment(input: CurriculumAnalysisInput) {
  const { targetJobRole, state, district, taughtSkills } = input;

  // 1. Normalize all input taught skills
  const normalizedTaught = await Promise.all(
    taughtSkills.map(async (s: string) => (await normalizeSkill(s)).toLowerCase())
  );
  const taughtSet = new Set(normalizedTaught);

  // 2. Fetch market signals for this job role (district/state priority)
  const where: any = {
    normalizedRole: { equals: targetJobRole, mode: "insensitive" },
  };
  if (state) where.state = { equals: state, mode: "insensitive" };
  if (district) where.district = { equals: district, mode: "insensitive" };

  let marketSignals = await prisma.jobMarketSignal.findMany({ where });

  // If no district-specific signals, expand to all signals for this role
  if (marketSignals.length === 0) {
    marketSignals = await prisma.jobMarketSignal.findMany({
      where: { normalizedRole: { equals: targetJobRole, mode: "insensitive" } },
    });
  }

  // Fallback defaults if new role is queried
  const industryRequirements =
    marketSignals.length > 0
      ? marketSignals.map((s: any) => ({
          skill: s.normalizedSkill,
          weight: s.demandScore > 85 ? 1.5 : 1.0,
          demandScore: s.demandScore,
          isEmerging: s.isEmerging,
          isObsolete: s.isObsolete,
          growthRate: s.growthRate,
        }))
      : [
          { skill: "JavaScript", weight: 1.0, demandScore: 80, isEmerging: false, isObsolete: false, growthRate: 15 },
          { skill: "React", weight: 1.5, demandScore: 92, isEmerging: false, isObsolete: false, growthRate: 28 },
          { skill: "Node.js", weight: 1.2, demandScore: 88, isEmerging: false, isObsolete: false, growthRate: 22 },
          { skill: "PostgreSQL", weight: 1.0, demandScore: 84, isEmerging: false, isObsolete: false, growthRate: 18 },
          { skill: "Generative AI", weight: 1.5, demandScore: 96, isEmerging: true, isObsolete: false, growthRate: 85 },
        ];

  // 3. Compute Coverage, Missing, Emerging, Obsolete
  const coveredSkills: any[] = [];
  const missingSkills: any[] = [];
  const emergingSkills: any[] = [];

  let totalRequiredWeight = 0;
  let coveredWeight = 0;

  for (const req of industryRequirements) {
    totalRequiredWeight += req.weight;
    const reqNormalizedLower = req.skill.toLowerCase();

    if (taughtSet.has(reqNormalizedLower)) {
      coveredWeight += req.weight;
      coveredSkills.push({
        skill: req.skill,
        demandScore: req.demandScore,
        status: "Covered in Curriculum",
        weight: req.weight,
      });
    } else {
      missingSkills.push({
        skill: req.skill,
        demandScore: req.demandScore,
        growthRate: req.growthRate,
        isEmerging: req.isEmerging,
        priority: req.demandScore > 85 ? "CRITICAL" : "RECOMMENDED",
      });
      if (req.isEmerging || req.growthRate > 30) {
        emergingSkills.push({
          skill: req.skill,
          demandScore: req.demandScore,
          growthRate: req.growthRate,
        });
      }
    }
  }

  // Detect taught skills that might be obsolete
  const obsoleteOrLowDemand: string[] = [];
  const obsoleteKnown = ["jquery", "php 5.6", "pascal", "cobol", "flash", "vb6", "xml rpc"];
  for (const skill of taughtSkills) {
    if (obsoleteKnown.includes(skill.toLowerCase())) {
      obsoleteOrLowDemand.push(skill);
    }
  }

  // Calculate Alignment Score (0 - 100)
  const alignmentScore =
    totalRequiredWeight > 0
      ? Number(((coveredWeight / totalRequiredWeight) * 100).toFixed(1))
      : 70;

  let status: AlignmentStatus = "HIGH_ALIGNMENT";
  if (alignmentScore < 50) {
    status = "CRITICAL_GAP";
  } else if (alignmentScore < 80) {
    status = "MODERATE_ALIGNMENT";
  }

  // Actionable Roadmap Recommendations
  const actionableRecommendations: string[] = [];
  if (missingSkills.length > 0) {
    actionableRecommendations.push(
      `Introduce elective lab modules on ${missingSkills.slice(0, 3).map((s: any) => s.skill).join(", ")} in Semester 5/6.`
    );
  }
  if (emergingSkills.length > 0) {
    actionableRecommendations.push(
      `Partner with regional industry for 30-hour hands-on micro-certifications in ${emergingSkills.map((s: any) => s.skill).join(", ")}.`
    );
  }
  if (obsoleteOrLowDemand.length > 0) {
    actionableRecommendations.push(
      `Phase out legacy subjects covering [${obsoleteOrLowDemand.join(", ")}] and reallocate lab hours to modern toolchains.`
    );
  }
  if (actionableRecommendations.length === 0) {
    actionableRecommendations.push("Curriculum is highly aligned with current market demand. Maintain bi-annual review cycles.");
  }

  return {
    targetJobRole,
    alignmentScore,
    status,
    totalIndustrySkillsEvaluated: industryRequirements.length,
    coveredSkillsCount: coveredSkills.length,
    missingSkillsCount: missingSkills.length,
    coveredSkills,
    missingSkills,
    emergingSkills,
    obsoleteOrLowDemand,
    actionableRecommendations,
  };
}

export async function getCourseHealthAnalytics(params: {
  collegeId?: string;
  state?: string;
  district?: string;
  sector?: string;
}) {
  const where: any = {};
  if (params.collegeId) where.collegeId = params.collegeId;
  if (params.state) where.state = { equals: params.state, mode: "insensitive" };
  if (params.district) where.district = { equals: params.district, mode: "insensitive" };
  if (params.sector) where.sector = { equals: params.sector, mode: "insensitive" };

  const courses = await prisma.course.findMany({
    where,
    include: { skills: true, college: true },
    orderBy: { alignmentScore: "desc" },
  });

  const analyzedCourses = courses.map((course: any) => {
    const placementRate =
      course.annualCapacity > 0
        ? Number(((course.placedCount / course.annualCapacity) * 100).toFixed(1))
        : 0;

    let computedHealth: CourseHealthStatus = course.healthStatus;
    let oversupplyRisk = "LOW";
    let alertMessage = "Operating normally with strong industry absorption.";

    if (placementRate < 35 && course.annualCapacity > 100) {
      computedHealth = "POTENTIAL_OVERSUPPLY";
      oversupplyRisk = "HIGH";
      alertMessage = `High capacity (${course.annualCapacity}) with low placement rate (${placementRate}%). Recommend seat reduction or syllabus overhaul.`;
    } else if (course.alignmentScore < 50 || placementRate < 50) {
      computedHealth = "NEEDS_UPDATE";
      oversupplyRisk = "MODERATE";
      alertMessage = "Curriculum alignment is deficient compared to regional hiring signals. Upgrade required.";
    } else if (course.currentEnrollment < course.annualCapacity * 0.4) {
      computedHealth = "LOW_DEMAND";
      oversupplyRisk = "LOW";
      alertMessage = "Enrollment is below 40% capacity. Evaluate market interest in this specialization.";
    }

    return {
      ...course,
      placementRate,
      healthStatus: computedHealth,
      oversupplyRisk,
      alertMessage,
    };
  });

  const healthyCount = analyzedCourses.filter((c: any) => c.healthStatus === "HEALTHY").length;
  const needsUpdateCount = analyzedCourses.filter((c: any) => c.healthStatus === "NEEDS_UPDATE").length;
  const oversupplyCount = analyzedCourses.filter((c: any) => c.healthStatus === "POTENTIAL_OVERSUPPLY").length;

  return {
    summary: {
      totalCourses: analyzedCourses.length,
      healthyCount,
      needsUpdateCount,
      oversupplyCount,
      avgAlignmentScore:
        analyzedCourses.length > 0
          ? Number((analyzedCourses.reduce((acc: number, c: any) => acc + c.alignmentScore, 0) / analyzedCourses.length).toFixed(1))
          : 0,
    },
    courses: analyzedCourses,
  };
}

export async function createOrUpdateCourse(data: {
  id?: string;
  collegeId?: string;
  name: string;
  code?: string;
  sector: string;
  department: string;
  state: string;
  district: string;
  durationMonths: number;
  annualCapacity: number;
  currentEnrollment: number;
  placedCount: number;
  skills: string[];
}) {
  const alignmentAnalysis = await analyzeCurriculumAlignment({
    targetJobRole: data.name,
    state: data.state,
    district: data.district,
    taughtSkills: data.skills,
  });

  let health: CourseHealthStatus = "HEALTHY";
  const placementRate = data.annualCapacity > 0 ? (data.placedCount / data.annualCapacity) * 100 : 0;
  if (placementRate < 35 && data.annualCapacity > 80) {
    health = "POTENTIAL_OVERSUPPLY";
  } else if (alignmentAnalysis.alignmentScore < 60) {
    health = "NEEDS_UPDATE";
  }

  if (data.id) {
    const updated = await prisma.course.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        sector: data.sector,
        department: data.department,
        state: data.state,
        district: data.district,
        durationMonths: data.durationMonths,
        annualCapacity: data.annualCapacity,
        currentEnrollment: data.currentEnrollment,
        placedCount: data.placedCount,
        alignmentScore: alignmentAnalysis.alignmentScore,
        healthStatus: health,
      },
    });

    await prisma.courseSkill.deleteMany({ where: { courseId: data.id } });
    for (const sk of data.skills) {
      await prisma.courseSkill.create({
        data: {
          courseId: updated.id,
          skillName: sk,
          proficiency: "INTERMEDIATE",
        },
      });
    }
    return updated;
  }

  const created = await prisma.course.create({
    data: {
      collegeId: data.collegeId,
      name: data.name,
      code: data.code,
      sector: data.sector,
      department: data.department,
      state: data.state,
      district: data.district,
      durationMonths: data.durationMonths,
      annualCapacity: data.annualCapacity,
      currentEnrollment: data.currentEnrollment,
      placedCount: data.placedCount,
      alignmentScore: alignmentAnalysis.alignmentScore,
      healthStatus: health,
    },
  });

  for (const sk of data.skills) {
    await prisma.courseSkill.create({
      data: {
        courseId: created.id,
        skillName: sk,
        proficiency: "INTERMEDIATE",
      },
    });
  }

  return created;
}
