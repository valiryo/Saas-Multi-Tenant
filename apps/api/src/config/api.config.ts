import { registerAs } from "@nestjs/config";
import { StringValue } from "ms";

export const apiConfig = registerAs('api', () => ({
    nodeEnv: process.env.NODE_ENV!,
    databaseUrl: process.env.DATABASE_URL!,
    port: process.env.PORT!,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,

}));