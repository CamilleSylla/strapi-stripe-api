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
import { CreatePaymentIntentInputs } from './inputs/create-payment-intent.input';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly config: ConfigService,
  ) {}
  async createPaymentIntent(products: CreatePaymentIntentInputs[]) {
    try {
      const slugs = products.map((product) => product.slug);
      const stripeProducts = await this.getStrapiProductPricesIds(slugs);
      const prices = await this.getStripeProductPricesAmount(stripeProducts);
      const amount = prices.reduce((acc, cur) => {
        const { quantity } = products.find((el) => el.slug === cur.Slug);
        const price = cur.unit_amount * quantity;
        return acc + price;
      }, 0);
      this.logger.log(`Creating payment intent, amount ${amount / 100}€`);
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
      });
      return {
        client_secret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw error;
    }
  }

  private async getStripeProductPricesAmount(
    products: { stripe_id: string; price_id: string; Slug: string }[],
  ) {
    return await Promise.all(
      products.map(async (product) => {
        this.logger.log(`Get ${product.stripe_id} price : ${product.price_id}`);
        const price = await this.stripe.prices.retrieve(product.price_id);
        return { ...product, unit_amount: price.unit_amount };
      }),
    );
  }

  private async getStrapiProductPricesIds(slugs: string[]) {
    const query = qs.stringify(
      {
        filters: {
          Slug: {
            $in: slugs,
          },
        },
      },
      {
        encodeValuesOnly: true, // prettify URL
      },
    );
    try {
      this.logger.log(
        `Get product informations from strapi for ${slugs.join(', ')}`,
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
      }: {
        data: {
          attributes: { stripe_id: string; price_id: string; Slug: string };
        }[];
      } = await fetchStrapiProducts.json();
      if (data.length !== slugs.length) {
        throw new BadRequestException('no products found');
      }

      return data.map((product) => {
        return {
          price_id: product.attributes.price_id,
          stripe_id: product.attributes.stripe_id,
          Slug: product.attributes.Slug,
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
