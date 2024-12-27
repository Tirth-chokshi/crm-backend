import {
  getMainActivity,
  getPendingActivities,
  getResolvedActivities,
  getRecentActivities,
  getUpcomingActivities,
  createActivity,
  activityDropdown,
  dailyFollowups,
  getActivityById,
  updateActivity,
  getCustomerActivity,
  activityHistory,
  todaysResolvedActivities
} from "../controllers/activityControllers.js"
import express from "express"

const router = express.Router()

router.get("/main", getMainActivity)
router.get("/pending", getPendingActivities)
router.get("/resolved", getResolvedActivities)
router.get("/recent", getRecentActivities)
router.get("/upcoming", getUpcomingActivities)
router.get('/dropdown', activityDropdown)
router.get('/history', activityHistory)
router.get('/todaysresolved',todaysResolvedActivities)
router.post("/create", createActivity)
router.get('/dailyfollowup',dailyFollowups)
router.get('/main/:id', getActivityById)
router.put('/update/:id', updateActivity)
router.get('/customer/:id', getCustomerActivity)
router.post('/customer/create', createActivity)

export default router
