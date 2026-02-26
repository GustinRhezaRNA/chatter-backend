import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@ArgsType()
export class GetMessagesArgs {
  @Field()
  @IsNotEmpty()
  chatId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  skip?: any;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  limit?: any;
}
