import { Request, Response, NextFunction } from "express";
import * as service from "./curriculum.service";

export async function analyzeAlignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { targetJobRole, state, district, taughtSkills } = req.body;
    const result = await service.analyzeCurriculumAlignment({
      targetJobRole: targetJobRole || "Full Stack Developer",
      state,
      district,
      taughtSkills: Array.isArray(taughtSkills) ? taughtSkills : [],
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getCourseHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const { collegeId, state, district, sector } = req.query;
    const result = await service.getCourseHealthAnalytics({
      collegeId: typeof collegeId === "string" ? collegeId : undefined,
      state: typeof state === "string" ? state : undefined,
      district: typeof district === "string" ? district : undefined,
      sector: typeof sector === "string" ? sector : undefined,
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function saveCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.createOrUpdateCourse(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
