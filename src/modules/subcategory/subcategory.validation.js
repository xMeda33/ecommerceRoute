import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createSubCategorySchema = joi
  .object({
    name: joi.string().required(),
    categoryId: joi.string().custom(isValidObjectId),
  })
  .required();

  export const updateSubCategorySchema = joi.object({
    name: joi.string(),
    categoryId: joi.string().custom(isValidObjectId),
    subcategoryId: joi.string().custom(isValidObjectId),
  }).required()
  export const deleteSubCategorySchema = joi.object({
    categoryId: joi.string().custom(isValidObjectId),
    subcategoryId: joi.string().custom(isValidObjectId),
  }).required()