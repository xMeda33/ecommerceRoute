import { cartModel } from "../../../DB/models/cart.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { productModel } from "./../../../DB/models/product.model.js";

export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("product not found"));
  }
  if (!product.inStock(quantity)) {
    return next(
      new Error(
        `not enough in stock only ${product.availableItems} are available`
      )
    );
  }
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $push: { products: { productId, quantity } } },
    { new: true }
  );
  return res.json({ success: true, result: cart });
});

export const userCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel
    .findOne({ user: req.user._id })
    .populate("products.productId", "name defaultImage.url price");
  return res.json({ success: true, result: cart });
});

export const updateCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("product not found"));
  }
  if (quantity > product.availableItems) {
    return next(
      new Error(
        `not enough products in stock only ${product.availableItems} left in stock`
      )
    );
  }
  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );
});

export const removeProduct = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $pop: { products: { productId: req.params.productId } } },
    { new: true }
  );
  return res.json({ success: true, result: cart });
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );
  return res.json({
    success: true,
    result: cart,
    message: "cart cleared successfully",
  });
});
