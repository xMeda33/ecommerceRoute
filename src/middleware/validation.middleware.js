import validate from "joi";
import { Types } from "mongoose";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("invalid object");
};

export const isValid = (schema) => {
  return (req, res, next) => {
    const copyReq = { ...req.body, ...req.params, ...req.query };
    const validationResult = schema.validate(copyReq, { abortEarly: true });
    if (validationResult.error) {
      const messages = validationResult.error.details.map((error) => {
        error.message;
      });
      return next(new Error(messages), { cause: 400 });
    }
    return next();
  };
};
