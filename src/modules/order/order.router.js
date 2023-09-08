import {Router} from 'express'
import { isAuth } from '../../middleware/authentication.middleware.js'
import { isValid } from '../../middleware/validation.middleware.js'
import * as order from './order.controller.js'
import { cancelOrderSchema, createOrderSchema } from './order.validation.js'

const router = Router()

router.post('/', isAuth, isValid(createOrderSchema), order.createOrder)
router.patch('/:orderId', isAuth, isValid(cancelOrderSchema), order.cancelOrder )

export default router