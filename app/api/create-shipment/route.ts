import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-28.acacia' as any });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      quoteId, shippingAs, 
      fromCountry, fromCity, fromPostal, fromAddress, fromName, fromPhone,
      toCountry, toCity, toPostal, toAddress, toName, toPhone,
      packages, totalWeight, totalCost 
    } = body;

    // 1. Save to Supabase
    const { data: shipment, error: dbError } = await supabase
      .from('shipments')
      .insert([
        {
          quote_id: quoteId || `SWIFT-${Math.floor(100000 + Math.random() * 900000)}`,
          shipping_as: shippingAs,
          origin_country: fromCountry,
          origin_city: fromCity,
          origin_postal: fromPostal,
          dest_country: toCountry,
          dest_city: toCity,
          dest_postal: toPostal,
          packages_data: packages,
          total_weight: totalWeight,
          total_amount: totalCost,
          payment_status: 'paid'
        }
      ])
      .select()
      .single();

    if (dbError) throw new Error(dbError.message);

    // 2. Call DHL Express Pickup API (Production Endpoint)
    /*
    const dhlResponse = await fetch('https://express.api.dhl.com/mydhlapi/test/shipments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.DHL_API_KEY}:${process.env.DHL_API_SECRET}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // DHL API Payload structure for Pickup & Waybill generation
        plannedShippingDate: new Date().toISOString().split('T')[0],
        pickup: {
          isRequested: true,
          readyTime: "10:00",
          closeTime: "17:00",
          location: "Reception"
        },
        accounts: [{ typeCode: "shipper", number: process.env.DHL_ACCOUNT_NUMBER }],
        customerDetails: {
          shipperDetails: {
            postalAddress: { countryCode: fromCountry, cityName: fromCity, postalCode: fromPostal, addressLine1: fromAddress },
            contactInformation: { fullName: fromName, phone: fromPhone }
          },
          receiverDetails: {
            postalAddress: { countryCode: toCountry, cityName: toCity, postalCode: toPostal, addressLine1: toAddress },
            contactInformation: { fullName: toName, phone: toPhone }
          }
        },
        content: {
          packages: packages.map((p: any) => ({
            weight: parseFloat(p.weight),
            dimensions: { length: parseFloat(p.length), width: parseFloat(p.width), height: parseFloat(p.height) }
          })),
          isCustomsDeclarable: true,
          unitOfMeasurement: "metric"
        }
      })
    });
    const dhlData = await dhlResponse.json();
    */

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Swiftline / DHL Express Shipping (${totalWeight} kg)`,
              description: `Route: ${fromCountry} to ${toCountry} | Ref: ${shipment.quote_id}`,
            },
            unit_amount: Math.round(parseFloat(totalCost) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}&quote_id=${shipment.quote_id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/book-shipment`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('DHL & Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}