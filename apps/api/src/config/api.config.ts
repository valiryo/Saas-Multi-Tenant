import { registerAs } from "@nestjs/config";
import { StringValue } from "ms";

export const apiConfig = registerAs('api', () => ({
    jwtSecret: process.env.JWT_SECRET!,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
}));