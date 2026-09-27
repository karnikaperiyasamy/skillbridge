import { prisma } from "../../config/prisma";
import { normalizeSkill, normalizeRole } from "./labourMarket.normalizer";
import { PriorityLevel } from "@prisma/client";

export async function getMarketOverview(params: {
  state?: string;
  district?: string;
  sector?: string;
}) {
  const where: any = {};
  if (params.state) where.state = { equals: params.state, mode: "insensitive" };
  if (params.district) where.district = { equals: params.district, mode: "insensitive" };
  if (params.sector) where.sector = { equals: params.sector, mode: "insensitive" };

  const signals = await prisma.jobMarketSignal.findMany({
    where,
    orderBy: { demandScore: "desc" },
  });

  // Calculate Aggregates
  const totalHiringVolume = signals.reduce((acc: number, s: any) => acc + s.hiringVolume, 0);
  const avgGrowthRate =
    signals.length > 0
      ? Number((signals.reduce((acc: number, s: any) => acc + s.growthRate, 0) / signals.length).toFixed(1))
      : 0;

  // Group by Normalized Role
  const roleMap: Record<string, { role: string; sector: string; demandScore: number; volume: number; count: number; growth: number }> = {};
  for (const s of signals) {
    if (!roleMap[s.normalizedRole]) {
      roleMap[s.normalizedRole] = {
        role: s.normalizedRole,
        sector: s.sector,
        demandScore: s.demandScore,
        volume: s.hiringVolume,
        count: 1,
        growth: s.growthRate,
      };
    } else {
      roleMap[s.normalizedRole].volume += s.hiringVolume;
      roleMap[s.normalizedRole].demandScore = Math.max(roleMap[s.normalizedRole].demandScore, s.demandScore);
      roleMap[s.normalizedRole].growth = (roleMap[s.normalizedRole].growth + s.growthRate) / 2;
      roleMap[s.normalizedRole].count += 1;
    }
  }

  const topRoles = Object.values(roleMap)
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 10);

  // Group by Normalized Skill
  const skillMap: Record<string, { skill: string; demandScore: number; volume: number; isEmerging: boolean; isObsolete: boolean; growth: number }> = {};
  for (const s of signals) {
    if (!skillMap[s.normalizedSkill]) {
      skillMap[s.normalizedSkill] = {
        skill: s.normalizedSkill,
        demandScore: s.demandScore,
        volume: s.hiringVolume,
        isEmerging: s.isEmerging,
        isObsolete: s.isObsolete,
        growth: s.growthRate,
      };
    } else {
      skillMap[s.normalizedSkill].volume += s.hiringVolume;
      skillMap[s.normalizedSkill].demandScore = Math.max(skillMap[s.normalizedSkill].demandScore, s.demandScore);
      skillMap[s.normalizedSkill].isEmerging = skillMap[s.normalizedSkill].isEmerging || s.isEmerging;
      skillMap[s.normalizedSkill].isObsolete = skillMap[s.normalizedSkill].isObsolete || s.isObsolete;
      skillMap[s.normalizedSkill].growth = (skillMap[s.normalizedSkill].growth + s.growthRate) / 2;
    }
  }

  const topSkills = Object.values(skillMap)
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 15);

  const emergingSkills = Object.values(skillMap)
    .filter((s) => s.isEmerging || s.growth > 30)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 8);

  const obsoleteSkills = Object.values(skillMap)
    .filter((s) => s.isObsolete || s.growth < 0)
    .sort((a, b) => a.growth - b.growth)
    .slice(0, 8);

  // Available Filter Options
  const distinctStates = await prisma.jobMarketSignal.findMany({
    select: { state: true },
    distinct: ["state"],
  });
  const distinctDistricts = await prisma.jobMarketSignal.findMany({
    select: { district: true, state: true },
    distinct: ["district", "state"],
  });
  const distinctSectors = await prisma.jobMarketSignal.findMany({
    select: { sector: true },
    distinct: ["sector"],
  });

  return {
    filters: {
      activeState: params.state || "All States",
      activeDistrict: params.district || "All Districts",
      activeSector: params.sector || "All Sectors",
      availableStates: distinctStates.map((s: { state: string }) => s.state),
      availableDistricts: distinctDistricts.map((d: { district: string; state: string }) => ({ district: d.district, state: d.state })),
      availableSectors: distinctSectors.map((s: { sector: string }) => s.sector),
    },
    metrics: {
      totalHiringVolume,
      avgGrowthRate,
      activeSignalCount: signals.length,
      dataSource: "National Labour Market Intelligence Network (SIH26134)",
      lastUpdated: new Date().toISOString(),
    },
    topRoles,
    topSkills,
    emergingSkills,
    obsoleteSkills,
    signals: signals.slice(0, 25),
  };
}

export async function getDistrictIntelligence(params: {
  state?: string;
  district?: string;
  sector?: string;
}) {
  const state = params.state || "Tamil Nadu";
  const district = params.district || "Chennai";

  const [marketSignals, trainerGaps, equipmentGaps, courses, trainingPlans] = await Promise.all([
    prisma.jobMarketSignal.findMany({
      where: {
        state: { equals: state, mode: "insensitive" },
        district: { equals: district, mode: "insensitive" },
        ...(params.sector ? { sector: { equals: params.sector, mode: "insensitive" } } : {}),
      },
    }),
    prisma.trainerCapacity.findMany({
      where: {
        state: { equals: state, mode: "insensitive" },
        district: { equals: district, mode: "insensitive" },
      },
    }),
    prisma.equipmentCapacity.findMany({
      where: {
        state: { equals: state, mode: "insensitive" },
        district: { equals: district, mode: "insensitive" },
      },
    }),
    prisma.course.findMany({
      where: {
        state: { equals: state, mode: "insensitive" },
        district: { equals: district, mode: "insensitive" },
      },
      include: { skills: true },
    }),
    prisma.districtTrainingPlan.findMany({
      where: {
        state: { equals: state, mode: "insensitive" },
        district: { equals: district, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Aggregate stats
  const totalOpenings = marketSignals.reduce((acc: number, s: any) => acc + s.hiringVolume, 0);
  const totalTrainersNeeded = trainerGaps.reduce((acc: number, t: any) => acc + t.gapCount, 0);
  const totalEquipmentCost = equipmentGaps.reduce((acc: number, e: any) => acc + e.estimatedCostInr, 0);
  const totalAnnualCapacity = courses.reduce((acc: number, c: any) => acc + c.annualCapacity, 0);
  const totalPlaced = courses.reduce((acc: number, c: any) => acc + c.placedCount, 0);
  const placementRate = totalAnnualCapacity > 0 ? Number(((totalPlaced / totalAnnualCapacity) * 100).toFixed(1)) : 0;

  return {
    location: { state, district },
    summary: {
      totalOpenings,
      totalTrainersNeeded,
      totalEquipmentCostInr: totalEquipmentCost,
      totalCoursesTracked: courses.length,
      averagePlacementRate: placementRate,
    },
    marketSignals,
    trainerGaps,
    equipmentGaps,
    courses,
    trainingPlans,
  };
}

export async function getTrainerAndEquipmentPlanning(params: {
  state?: string;
  district?: string;
  sector?: string;
}) {
  const where: any = {};
  if (params.state) where.state = { equals: params.state, mode: "insensitive" };
  if (params.district) where.district = { equals: params.district, mode: "insensitive" };
  if (params.sector) where.sector = { equals: params.sector, mode: "insensitive" };

  const [trainers, equipment] = await Promise.all([
    prisma.trainerCapacity.findMany({ where, orderBy: { gapCount: "desc" } }),
    prisma.equipmentCapacity.findMany({ where, orderBy: { gapUnits: "desc" } }),
  ]);

  const totalTrainerDeficit = trainers.reduce((acc: number, t: any) => acc + t.gapCount, 0);
  const totalEquipmentDeficitUnits = equipment.reduce((acc: number, e: any) => acc + e.gapUnits, 0);
  const totalEstimatedCost = equipment.reduce((acc: number, e: any) => acc + e.estimatedCostInr, 0);

  return {
    stats: {
      totalTrainerDeficit,
      totalEquipmentDeficitUnits,
      totalEstimatedCostInr: totalEstimatedCost,
    },
    trainers,
    equipment,
  };
}

export async function getDistrictTrainingPlans(params: {
  state?: string;
  district?: string;
  sector?: string;
  priority?: PriorityLevel;
}) {
  const where: any = {};
  if (params.state) where.state = { equals: params.state, mode: "insensitive" };
  if (params.district) where.district = { equals: params.district, mode: "insensitive" };
  if (params.sector) where.sector = { equals: params.sector, mode: "insensitive" };
  if (params.priority) where.priority = params.priority;

  return await prisma.districtTrainingPlan.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createDistrictTrainingPlan(data: {
  state: string;
  district: string;
  sector: string;
  priority: PriorityLevel;
  targetRole: string;
  recommendedAction: string;
  estimatedBudgetInr: number;
  targetBeneficiaries: number;
  rationale: string;
  trainerGapAddressed?: number;
  equipmentGapAddressed?: number;
}) {
  return await prisma.districtTrainingPlan.create({
    data: {
      ...data,
      trainerGapAddressed: data.trainerGapAddressed ?? 0,
      equipmentGapAddressed: data.equipmentGapAddressed ?? 0,
      status: "PROPOSED",
    },
  });
}
