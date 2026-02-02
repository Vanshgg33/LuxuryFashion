import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// User payload from JWT token
export interface JwtUserPayload {
  userId: string;
  role: string;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtUserPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});


