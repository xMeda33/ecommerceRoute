import { cartModel } from "../../../DB/models/cart.model.js";
import { couponModel } from "../../../DB/models/coupon.model.js";
import { orderModel } from "../../../DB/models/order.model.js";
import { productModel } from "../../../DB/models/product.model.js";
import { createInvoice } from "../../utils/pdfTemp.js";
import asyncHandler from "../../utils/asyncHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../../utils/cloudinary.js";
import { sendEmail } from "../../utils/sendEmails.js";
import { clearCart, updateStock } from "./order.service.js";
import Stripe from "stripe";
import { log } from "console";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = asyncHandler(async (req, res, next) => {
  const { payment, address, phone, coupon } = req.body;
  let finalPrice;
  let checkCoupon;
  if (coupon) {
    checkCoupon = await couponModel.findOne({
      name: coupon,
      // expiredAt: { $gt: Date.now() },
    });
    if (!checkCoupon) {
      return next(new Error("coupon not valid"));
    }
  }
  const cart = await cartModel.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) {
    return next(new Error("empty cart"));
  }
  let orderProducts = [];
  let orderPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const product = await productModel.findById(products[i].productId);
    if (!product) {
      return next(new Error(`product ${products[i].productId} was not found`));
    }
    if (!product.inStock(products[i].quantity)) {
      return next(
        new Error(`Product ${product.name} doesnt have enough items in stock`)
      );
    }
    finalPrice = product.price;
    if (checkCoupon) {
      finalPrice = product.price - (product.price * checkCoupon.discount) / 100;
      console.log("inside if condition");
    }

    orderProducts.push({
      productId: product._id,
      quantity: products[i].quantity,
      name: product.name,
      price: product.price,
      totalPrice: products[i].quantity * product.price,
    });
    orderPrice += products[i].quantity * product.price;
    console.log(orderProducts);
  }
  const order = await orderModel.create({
    user: req.user._id,
    products: orderProducts,
    address,
    phone,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
    payment,
    price: orderPrice,
  });

  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: finalPrice,
    invoice_nr: order._id,
  };
  const pdfPath = path.join(
    __dirname,
    `./../../../invoiceTemp/${order._id}.pdf`
  );
  createInvoice(invoice, pdfPath);
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.FOLDER_CLOUD}/order/invoice/${user._id}`,
  });
  order.invoice = { id: public_id, url: secure_url };
  await order.save();
  const isSent = await sendEmail({
    to: user.email,
    subject: `order invoice ${order._id}`,
    attachments: [
      {
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  });
  if (isSent) {
    updateStock(order.products, true);
    clearCart(user._id);
  }
  //stripe payment
  if (payment === "visa") {
    const stripe = Stripe(process.env.STRIPE_KEY);
    let existCoupon;
    if (order.coupon.name !== undefined) {
      existCoupon = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: { order_id: order._id.toString() },
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              // images: [product.productId.defaultImage.url],
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: existCoupon ? [{ coupon: existCoupon.id }] : [],
    });
    return res.json({ success: true, results: session.url });
  }
  //response
  return res.json({
    success: true,
    result: order,
    message: "order created successfully",
  });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.orderId);
  if (!order) {
    return next(new Error("Invalid order id"));
  }
  if (order.status === "delevired" || order.status === "refunded") {
    return next(new Error("order can't be canceled"));
  }
  order.status = "canceled";
  updateStock(order.products, false);
  await order.save();
  return res.json({ success: true, result: order });
});

export const webHook = asyncHandler(async (req, res, next) => {
  // This is your Stripe CLI webhook secret for testing your endpoint locally.

  const stripe = new Stripe(process.env.STRIPE_KEY);

  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.END_POINT_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const orderId = event.data.object.metadata.order_id;
  // Handle the event
  if (event.type === "checkout.session.completed") {
    await orderModel.findByIdAndUpdate(
      orderId,
      { status: "visa paid" },
      { new: true }
    );
    return;
  }
  await orderModel.findByIdAndUpdate(
    orderId,
    { status: "visa failed" },
    { new: true }
  );
  return;

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});
