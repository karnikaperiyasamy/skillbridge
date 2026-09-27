import { Request, Response, NextFunction } from "express";
import * as service from "./labourMarket.service";
import { normalizeSkill } from "./labourMarket.normalizer";
import { seedLabourMarketData } from "./labourMarket.seed";

export async function getMarketOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const { state, district, sector } = req.query;
    const overview = await service.getMarketOverview({
      state: typeof state === "string" ? state : undefined,
      district: typeof district === "string" ? district : undefined,
      sector: typeof sector === "string" ? sector : undefined,
    });
    return res.json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
}

export async function getDistrictIntelligence(req: Request, res: Response, next: NextFunction) {
  try {
    const { state, district, sector } = req.query;
    const details = await service.getDistrictIntelligence({
      state: typeof state === "string" ? state : undefined,
      district: typeof district === "string" ? district : undefined,
      sector: typeof sector === "string" ? sector : undefined,
    });
    return res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
}

export async function getTrainerEquipmentPlanning(req: Request, res: Response, next: NextFunction) {
  try {
    const { state, district, sector } = req.query;
    const planning = await service.getTrainerAndEquipmentPlanning({
      state: typeof state === "string" ? state : undefined,
      district: typeof district === "string" ? district : undefined,
      sector: typeof sector === "string" ? sector : undefined,
    });
    return res.json({ success: true, data: planning });
  } catch (err) {
    next(err);
  }
}

export async function getDistrictTrainingPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const { state, district, sector, priority } = req.query;
    const plans = await service.getDistrictTrainingPlans({
      state: typeof state === "string" ? state : undefined,
      district: typeof district === "string" ? district : undefined,
      sector: typeof sector === "string" ? sector : undefined,
      priority: priority as any,
    });
    return res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}

export async function createDistrictTrainingPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await service.createDistrictTrainingPlan(req.body);
    return res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function normalizeSkillHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawSkill = (req.query.skill as string) || (req.body.skill as string) || "";
    const normalized = await normalizeSkill(rawSkill);
    return res.json({ success: true, original: rawSkill, normalized });
  } catch (err) {
    next(err);
  }
}

export async function triggerSeedDemoData(_req: Request, res: Response, next: NextFunction) {
  try {
    await seedLabourMarketData();
    return res.json({ success: true, message: "Labour market demo data seeded successfully." });
  } catch (err) {
    next(err);
  }
}
