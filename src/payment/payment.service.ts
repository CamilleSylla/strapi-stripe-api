import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STRIPE_CLIENT } from 'src/stripe/constants';
import fetch from 'node-fetch';
import Stripe from 'stripe';
import * as qs from 'qs';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly config: ConfigService,
  ) {}
  async createPaymentIntent(productIds: string[]) {
    const stripeProduct = await this.getStrapiProductPricesIds(productIds);
    const prices = await this.getStripeProductPricesAmount(stripeProduct);
    const amount = prices.reduce((acc, cur) => acc + cur.unit_amount, 0);
    this.logger.log(`Creating payment intent, amount ${amount / 100}€`);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });
    return {
      client_secret: paymentIntent.client_secret,
    };
  }

  private async getStripeProductPricesAmount(
    products: { stripe_id: string; price_id: string }[],
  ) {
    return await Promise.all(
      products.map(async (product) => {
        this.logger.log(`Get ${product.stripe_id} price : ${product.price_id}`);
        const price = await this.stripe.prices.retrieve(product.price_id);
        return { ...product, unit_amount: price.unit_amount };
      }),
    );
  }

  private async getStrapiProductPricesIds(ids: string[]) {
    const query = qs.stringify(
      {
        filters: {
          id: {
            $in: ids,
          },
        },
      },
      {
        encodeValuesOnly: true, // prettify URL
      },
    );
    try {
      this.logger.log(
        `Get product informations from strapi for ${ids.join(', ')}`,
      );
      const fetchStrapiProducts = await fetch(
        `${this.config.get('STRAPI_BASE_URL')}/api/products?${query}`,
        {
          headers: {
            authorization: `Bearer ${this.config.get('STRAPI_API_KEY')}`,
          },
        },
      );
      const {
        data,
      }: { data: { attributes: { stripe_id: string; price_id: string } }[] } =
        await fetchStrapiProducts.json();
      if (data.length !== ids.length) {
        throw new BadRequestException('no products found');
      }

      return data.map((product) => {
        return {
          price_id: product.attributes.price_id,
          stripe_id: product.attributes.stripe_id,
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
