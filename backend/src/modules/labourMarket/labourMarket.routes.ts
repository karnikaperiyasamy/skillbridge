import { Router } from "express";
import * as ctrl from "./labourMarket.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

// Public / Authenticated read access
router.get("/overview", ctrl.getMarketOverview);
router.get("/district-intelligence", ctrl.getDistrictIntelligence);
router.get("/capacity-planning", ctrl.getTrainerEquipmentPlanning);
router.get("/training-plans", ctrl.getDistrictTrainingPlans);
router.get("/normalize-skill", ctrl.normalizeSkillHandler);
router.post("/normalize-skill", ctrl.normalizeSkillHandler);

// Admin / Govt / College authorized actions
router.post("/training-plans", authenticate, authorize("ADMIN", "COLLEGE"), ctrl.createDistrictTrainingPlan);
router.post("/seed-demo", authenticate, authorize("ADMIN"), ctrl.triggerSeedDemoData);

export default router;
