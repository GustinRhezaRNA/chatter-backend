import { User } from "src/users/entities/user.entity";

type TokenPayload = Omit<User, '_id'> & { _id: string };

export { TokenPayload };
