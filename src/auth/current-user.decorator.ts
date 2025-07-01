import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';

const getUserByContext = (context: ExecutionContext): User => {
  const request = context.switchToHttp().getRequest<Request>();
  return request.user as User;
};

export const CurretUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getUserByContext(context),
);
