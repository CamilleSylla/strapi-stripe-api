import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaymentIntentOutput } from './output/payment-intent.output';
import { PaymentService } from './payment.service';
import { CreatePaymentIntent } from './output/create-payment-intent.output';

@Resolver(() => PaymentIntentOutput)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Mutation(() => CreatePaymentIntent)
  async createPaymentIntent(
    @Args('productIds', { type: () => [String] }) productIds: string[],
  ) {
    return await this.paymentService.createPaymentIntent(productIds);
  }
}
