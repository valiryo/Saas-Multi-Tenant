import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TokenPayload } from "@saas/usuarios";

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): TokenPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request['user'];
    }
)