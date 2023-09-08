import { Router } from "express";
import { isAuth } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import * as subCategory from "./subcategory.controller.js";
import {createSubCategorySchema, updateSubCategorySchema, deleteSubCategorySchema} from './subcategory.validation.js'

const router = Router({mergeParams: true});

router.post(
  "/",
  isAuth,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("subcategory"),
  isValid(createSubCategorySchema),
  subCategory.createSubCategory
);
router.patch(
  "/:subcategoryId",
  isAuth,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("subcategory"),
  isValid(updateSubCategorySchema),
  subCategory.updateSubCategory
);
router.delete(
  "/:subcategoryId",
  isAuth,
  isAuthorized("admin"),
  isValid(deleteSubCategorySchema),
  subCategory.deleteSubCategory
)
router.get('/', subCategory.getAllSubCategories)
export default router;
