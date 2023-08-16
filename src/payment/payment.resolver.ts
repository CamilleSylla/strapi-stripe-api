import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaymentIntentOutput } from './output/payment-intent.output';
import { PaymentService } from './payment.service';
import { CreatePaymentIntent } from './output/create-payment-intent.output';
import { CreatePaymentIntentInputs } from './inputs/create-payment-intent.input';
import { UpdatePaymentIntentShippingInput } from './inputs/update-payment-intent.input';

@Resolver(() => PaymentIntentOutput)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Mutation(() => CreatePaymentIntent)
  async createPaymentIntent(
    @Args('products', { type: () => [CreatePaymentIntentInputs] })
    productIds: CreatePaymentIntentInputs[],
  ) {
    return await this.paymentService.createPaymentIntent(productIds);
  }

  @Mutation(() => CreatePaymentIntent)
  async updatePaymentIntentShipping(
    @Args('infos', { type: () => UpdatePaymentIntentShippingInput })
    infos: UpdatePaymentIntentShippingInput,
    @Args('client_secret', { type: () => String }) client_secret: string,
  ) {
    return await this.paymentService.updatePaymentIntentShipping(infos, client_secret);
  }
}
