// Submit routes

import { Router } from 'express'
import { SubmitController } from '../controllers/submitController.js'

const router = Router()

// POST /api/submit - Submit Event to N8N
router.post('/', SubmitController.submit)

export default router
