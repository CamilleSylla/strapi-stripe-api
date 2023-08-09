import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PaymentIntentOutput {
  @Field()
  id: string;

  @Field(() => String)
  object: string;

  @Field(() => Int)
  amount: number;

  @Field(() => String)
  amount_capturable: number;

  @Field(() => String, { nullable: true })
  statement_descriptor: string | null;

  @Field(() => String, { nullable: true })
  statement_descriptor_suffix: string | null;

  @Field()
  status: string;

  @Field(() => String, { nullable: true })
  transfer_group: string | null;
}
