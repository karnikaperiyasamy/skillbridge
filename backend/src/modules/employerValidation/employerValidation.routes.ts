import { Router } from "express";
import * as ctrl from "./employerValidation.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.get("/", ctrl.listValidations);
router.post("/", authenticate, authorize("COMPANY"), ctrl.submitValidation);

export default router;
