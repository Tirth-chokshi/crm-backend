import express from "express";
import { getTopCustomers, actiivityTypeDistribution } from "../controllers/analyticsControllers.js";

const router = express.Router();

router.get("/topcustomers", getTopCustomers);
router.get("/activitytype", actiivityTypeDistribution);

export default router;