import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production")
    .required(),

  DATABASE_URL: Joi.string()
    .required(),

  PORT: Joi.number()
    .port()
    .required(),

  JWT_ACCESS_SECRET: Joi.string()
    .min(64)
    .required(),

  JWT_REFRESH_SECRET: Joi.string()
    .min(64)
    .required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .required(),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .required(),
});