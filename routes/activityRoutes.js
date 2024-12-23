import {
  getMainActivity,
  getPendingActivities,
  getResolvedActivities,
  getRecentActivities,
  getUpcomingActivities,
  createActivity
} from "../controllers/activityControllers.js"
import express from "express"

const router = express.Router()

router.get("/main", getMainActivity)
router.get("/pending", getPendingActivities)
router.get("/resolved", getResolvedActivities)
router.get("/recent", getRecentActivities)
router.get("/upcoming", getUpcomingActivities)
router.post("/create", createActivity)

export default router
