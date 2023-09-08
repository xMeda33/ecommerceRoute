import { Router } from "express";
import { isAuth } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import * as product from "./product.controller.js";
import { createProductSchema, productIdSchema } from "./product.validation.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  isAuth,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  isValid(createProductSchema),
  product.createProduct
);
router.delete(
  "/:productId",
  isAuth,
  isAuthorized("admin"),
  isValid(productIdSchema),
  product.deleteProduct
);
router.get("/", product.getAllProducts);
router.get(
  "/single/:productId",
  isValid(productIdSchema),
  product.getSingleProduct
);

export default router;
