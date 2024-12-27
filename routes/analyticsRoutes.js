import express from "express";
import { getTopCustomers, actiivityTypeDistribution, caseResolution } from "../controllers/analyticsControllers.js";

const router = express.Router();

router.get("/topcustomers", getTopCustomers);
router.get("/activitytype", actiivityTypeDistribution);
router.get("/caseresolution", caseResolution);

export default router;