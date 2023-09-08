import { Router } from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import { createBrandSchema, deleteBrandSchema, updateBrandSchema } from "./brand.validation.js";
import * as brand from "./brand.controller.js";
import { isAuth } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

router.post(
  "/",
  isAuth,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"),
  isValid(createBrandSchema),
  brand.createBrand
);
router.patch(
  "/:brandId",
  isAuth,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"),
  isValid(updateBrandSchema),
  brand.updateBrand
);
router.delete( "/:brandId",
isAuth,
isAuthorized("admin"),
isValid(deleteBrandSchema),
brand.deleteBrand)
router.get('/', brand.getAllBrand)

export default router;
