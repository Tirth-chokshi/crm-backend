import { getPendingActivities,getResolvedActivities,getRecentActivities,getUpcomingActivities } from "../controllers/activityControllers.js"
import express from "express"

const router = express.Router()

router.get('/pending',getPendingActivities)
router.get('/resolved',getResolvedActivities)
router.get('/recent',getRecentActivities)
router.get('/upcoming',getUpcomingActivities)


export default router
