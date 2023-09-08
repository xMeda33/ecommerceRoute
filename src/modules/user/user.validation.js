import joi from "joi";
const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#.])[A-Za-z\d$@$!%*?&.]{8,20}/"
//register
export const registerSchema = joi
  .object({
    userName: joi.string().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(20).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();

//confirmEmail
export const activationSchema = joi
  .object({
    activationCode: joi.string().required(),
  })
  .required();

export const loginSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

export const forgetCodeSchema = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

  export const resetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    code: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required()
  }).required()