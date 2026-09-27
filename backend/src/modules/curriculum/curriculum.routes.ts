import { Router } from "express";
import * as ctrl from "./curriculum.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

// Public / Authenticated read & analyze
router.post("/analyze", ctrl.analyzeAlignment);
router.get("/course-health", ctrl.getCourseHealth);

// College / Admin Course Management
router.post("/courses", authenticate, authorize("COLLEGE", "ADMIN"), ctrl.saveCourse);

export default router;
