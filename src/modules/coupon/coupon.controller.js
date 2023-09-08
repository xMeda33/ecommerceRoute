import asyncHandler from "../../utils/asyncHandler.js";
import voucher_codes from "voucher-code-generator";
import { couponModel } from "./../../../DB/models/coupon.model.js";

export const createCoupon = asyncHandler(async (req, res, next) => {
  const code = voucher_codes.generate({ length: 5 });
  const coupon = await couponModel.create({
    name: code[0],
    discount: req.body.discount,
    expireDate: new Date(req.body.expireDate).getTime(),
    createdBy: req.user._id,
  });
  return res.json({ success: true, results: coupon });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await couponModel.findOne({
    name: req.params.code,
    expireDate: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new Error("no coupon with this code"));
  }
  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expireDate = req.body.expireDate
    ? new Date(req.body.expireDate).getTime()
    : coupon.expireDate;
  await coupon.save();
  return res.json({ success: true, result: coupon });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await couponModel.findOne({ name: req.params.code });
  if (!coupon) {
    return next(new Error("no coupon with this code"));
  }
  await couponModel.findOneAndDelete({ name: req.params.code });
  return res.json({ success: true, result: "deleted successfully" });
});

export const getAllCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await couponModel.find();
  return res.json({ success: true, result: coupons });
});
