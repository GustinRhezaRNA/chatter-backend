import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

const getUserByContext = (context: ExecutionContext): User | undefined => {
  if (context.getType() === 'http') {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as User;
  } else if (context.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext<{
      req: { user: User };
    }>().req.user;
  }
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getUserByContext(context),
);
