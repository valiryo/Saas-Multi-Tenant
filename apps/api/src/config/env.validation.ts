import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  JWT_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .required(),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .required(),
});