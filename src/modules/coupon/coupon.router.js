import { Router } from "express";
import { isAuth } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { createCouponSchema, deleteCouponSchema, updateCouponSchema } from "./coupon.validation.js";
import * as coupon from "./coupon.controller.js";

const router = Router();

router.post(
  "/",
  isAuth,
  isAuthorized("admin"),
  isValid(createCouponSchema),
  coupon.createCoupon
);
router.patch(
  "/:code",
  isAuth,
  isAuthorized("admin"),
  isValid(updateCouponSchema),
  coupon.updateCoupon
);

router.delete(
  "/:code",
  isAuth,
  isAuthorized("admin"),
  isValid(deleteCouponSchema),
  coupon.deleteCoupon
);
router.get('/', coupon.getAllCoupons)

export default router;
