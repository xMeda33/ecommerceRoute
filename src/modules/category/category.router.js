import { Router } from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validation.js";
import * as category from "./category.controller.js";
import { isAuth } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import subCategoryRouter from './../subcategory/subcategory.router.js'
import productRouter from './../product/product.router.js'

const router = Router();

router.use('/:categoryId/subcategory', subCategoryRouter)
router.use(':categoryId/products', productRouter)
router.post(
  "/",
  isAuth,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  isValid(createCategorySchema),
  category.createCategory
);
router.patch(
  "/:categoryId",
  isAuth,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  isValid(updateCategorySchema),
  category.updateCategory
);
router.delete( "/:categoryId",
isAuth,
isAuthorized("admin"),
isValid(deleteCategorySchema),
category.deleteCategory)
router.get('/', category.getAllCategory)

export default router;
