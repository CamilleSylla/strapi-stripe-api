import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreatePaymentIntent {
  @Field(() => String)
  client_secret: string;
}
