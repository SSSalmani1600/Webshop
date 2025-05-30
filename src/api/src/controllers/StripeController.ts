import { Request, Response } from 'express';
// @ts-ignore – voorkomt rode streep bij 'require'
const Stripe = require('stripe') as typeof import('stripe');

// Stripe initialiseren met je geheime sleutel en API-versie
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

/**
 * Start een testbetaling via Stripe Checkout.
 * Retourneert een betaallink in JSON.
 */
export const startPayment = async (_req: Request, res: Response): Promise<void> => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // alleen test creditcard
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Schoolopdracht testproduct',
            },
            unit_amount: 1000, // €10,00 in centen
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://voorbeeld.nl/success',
      cancel_url: 'https://voorbeeld.nl/cancel',
    });

    // Stuur de betaallink terug
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij aanmaken betaling' });
  }
};
