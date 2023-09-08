import asyncHandler from "../../utils/asyncHandler.js";
import { sendEmail } from "../../utils/sendEmails.js";
import userModel from "./../../../DB/models/user.model.js";
import {cartModel} from "./../../../DB/models/cart.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import tokenModel from "../../../DB/models/token.model.js";
import randomstring from "randomstring";
//register
export const register = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;
  const isUser = await userModel.findOne({ email });
  if (isUser) {
    return next(
      new Error("Email already exists try signing in or using a new email", {
        cause: 409,
      })
    );
  }
  const hashPassword = bcryptjs.hashSync(
    password,
    parseInt(process.env.SALT_ROUND)
  );
  const activationCode = crypto.randomBytes(64).toString("hex");
  const user = await userModel.create({
    userName,
    email,
    password: hashPassword,
    activationCode,
  });
  const link = `http://localhost:5000/auth/confirmEmail/${activationCode}`;
  const isSent = await sendEmail({
    to: email,
    subject: "activation email",
    html: `<a href=${link}>activate</a>`,
  });
  return isSent
    ? res.json({ success: true, message: "please review your email" })
    : next(new Error("Something went wrong"));
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOneAndUpdate(
    { activationCode: req.params.activationCode },
    {
      isConfirmed: true,
      $unset: { activationCode: 1 },
    }
  );
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  await cartModel.create({ user: user._id });
  return res.json({ success: "You have successfully activated your account" });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }
  if (!user.isConfirmed) {
    return next(new Error("User account is not activated", { cause: 400 }));
  }
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) {
    return next(new Error("invalid password", { cause: 400 }));
  }
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.TOKEN_KEY,
    {
      expiresIn: "2d",
    }
  );
  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });
  user.status = "online";
  await user.save();
  return res.json({ success: true, results: token });
});

export const forgetCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Invalid email", { cause: 404 }));
  }
  const code = randomstring.generate({
    length: 5,
    charset: "numeric",
  });
  user.forgetCode = code;
  await user.save();
  return (await sendEmail({
    to: user.email,
    subject: "reset password",
    html: `<h2>${code}</h2>`,
  }))
    ? res.json({ success: true, message: "check your email" })
    : next(new Error("something went wrong"));
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { code, password, email } = req.body;
  let user = await userModel.findOne({ forgetCode: code });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  user = await userModel.findOneAndUpdate(
    { email },
    { $unset: { forgetCode: 1 } }
  );
  user.password = bcryptjs.hashSync(password, parseInt(process.env.SALT_ROUND));
  await user.save();
  const tokens = tokenModel.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  return res.json({ success: true, message: "changed successfully" });
});
