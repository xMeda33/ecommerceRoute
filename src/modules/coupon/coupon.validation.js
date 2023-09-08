import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createCouponSchema = joi
  .object({
    discount: joi.number().min(1).max(100).required(),
    expireDate: joi.date().greater(Date.now()).required(),
  })
  .required();

export const updateCouponSchema = joi.object({
    code: joi.string().length(5).required(),
    discount: joi.number().min(1).max(100),
    expireDate: joi.date().greater(Date.now())
}).required();

export const deleteCouponSchema = joi.object({
  code: joi.string().length(5).required()
}).required()