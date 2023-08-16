import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdatePaymentIntentShippingInput {
  @Field(() => String)
  street: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  zip: string;

  @Field(() => String)
  country: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  phone?: string;
}
