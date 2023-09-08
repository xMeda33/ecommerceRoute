import { Router } from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import { activationSchema, registerSchema, loginSchema, forgetCodeSchema, resetPasswordSchema } from "./user.validation.js";
import * as user from './user.controller.js'

const router = Router()

//Register
router.post('/register', isValid(registerSchema), user.register)
// Activation
router.get('/confirmEmail/:activationCode', isValid(activationSchema), user.confirmEmail)
//Login
router.post('/login', isValid(loginSchema), user.login)
//Send forget code
router.patch('/forgetCode', isValid(forgetCodeSchema), user.forgetCode)
//Reset password
router.patch('/resetPassword', isValid(resetPasswordSchema), user.resetPassword)

export default router