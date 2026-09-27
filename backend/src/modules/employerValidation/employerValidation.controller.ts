import { Request, Response, NextFunction } from "express";
import * as service from "./employerValidation.service";
import { prisma } from "../../config/prisma";

export async function submitValidation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) {
      return res.status(403).json({ error: "Only companies can submit skill validations." });
    }

    const result = await service.submitEmployerValidation({
      companyId: company.id,
      jobRole: req.body.jobRole,
      skillName: req.body.skillName,
      relevanceStatus: req.body.relevanceStatus || "HIGH_PRIORITY",
      feedback: req.body.feedback,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobRole, skillName } = req.query;
    const validations = await service.getEmployerValidations({
      jobRole: typeof jobRole === "string" ? jobRole : undefined,
      skillName: typeof skillName === "string" ? skillName : undefined,
    });
    return res.json({ success: true, data: validations });
  } catch (err) {
    next(err);
  }
}
