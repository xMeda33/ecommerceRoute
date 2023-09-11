import { Router, application } from "express";
import { isAuth } from "../../middleware/authentication.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import * as order from "./order.controller.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import express from 'express'

const router = Router();

router.post("/", isAuth, isValid(createOrderSchema), order.createOrder);
router.patch(
  "/:orderId",
  isAuth,
  isValid(cancelOrderSchema),
  order.cancelOrder
);
// WEBHOOK ENDPOINT
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  order.webHook
);

export default router;
