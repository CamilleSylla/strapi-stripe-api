import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePaymentIntentInputs {
  @Field(() => String)
  slug: string;

  @Field(() => Number)
  quantity: number;
}
