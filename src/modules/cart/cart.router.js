import { Router } from "express";
import { isAuth } from "../../middleware/authentication.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import * as cart from "./cart.controller.js";
import { cartSchema, removeProductSchema } from "./cart.validation.js";

const router = Router();

router.post("/", isAuth, isValid(cartSchema), cart.addToCart);
router.get("/", isAuth, cart.userCart);
router.patch("/", isAuth, isValid(cartSchema), cart.updateCart);
router.patch("/clear", isAuth, cart.clearCart)
router.patch(
  "/:productId",
  isAuth,
  isValid(removeProductSchema),
  cart.removeProduct
);

export default router;
