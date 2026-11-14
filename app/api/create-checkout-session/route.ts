 import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-28.acacia' as any,
});

export async function POST(request: Request) {
  try {
    const { amount, itemName, customerEmail } = await request.json();

    if (!amount || !itemName) {
      return NextResponse.json({ error: "Amount and item name are required" }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
            },
            unit_amount: Math.round(amount * 100), // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/invoices?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/invoices?canceled=true`,
    });

    return NextResponse.json({ success: true, url: session.url });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}