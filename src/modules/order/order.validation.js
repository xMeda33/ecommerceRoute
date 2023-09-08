import joi from "joi"
import { isValidObjectId } from "../../middleware/validation.middleware.js"
const pattern = "^(01)[0-2,5]{1}[0-9]{8}"
export const createOrderSchema = joi.object({
    address: joi.string().min(10).required(),
    coupon: joi.string().length(5),
    phone: joi.string().regex(RegExp(pattern)).required(),
    payment: joi.string().valid("cash", "visa").required()
}).required()

export const cancelOrderSchema = joi.object({
    orderId: joi.string().custom(isValidObjectId)
}).required()