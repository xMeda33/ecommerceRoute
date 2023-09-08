import joi from 'joi'
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createProductSchema = joi.object({
    name: joi.string().min(2).max(20).required(),
    description: joi.string(),
    availableItems: joi.number().min(1).required(),
    price: joi.number().min(1).required(),
    discount: joi.number().min(1).max(100),
    category: joi.string().custom(isValidObjectId).required(),
    subCategory: joi.string().custom(isValidObjectId).required(),
    brand: joi.string().custom(isValidObjectId).required()
}).required()

export const productIdSchema = joi.object({
    productId: joi.string().custom(isValidObjectId).required(),
}).required()