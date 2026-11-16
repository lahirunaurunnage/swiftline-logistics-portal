 import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization (Service Role Key පාවිච්චි කිරීම)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Stripe එක POST request එක ඇතුළේ ଇନିෂියාස් කිරීම (Build-time errors වළක්වයි)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as any,
    });

    const body = await req.json();
    const { clientId, productName, quantity, supplierContact, specialNotes } = body;

    if (!clientId || !productName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Supabase වල qc_jobs ටේබල් එකට ඩේටා සේව් කිරීම (Awaiting Payment ස්ටේටස් එකෙන්)
    const { data: jobData, error: dbError } = await supabase
      .from("qc_jobs")
      .insert([
        {
          client_id: clientId,
          product_name: productName,
          quantity: quantity || 1,
          supplier_contact: supplierContact || "",
          special_notes: specialNotes || "",
          status: "Awaiting Payment",
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    const jobId = jobData.job_id;

    // 3. Stripe Checkout Session එක ක්‍රියට් කිරීම ($99 Fixed Price for QC Inspection)
    const session = await stripe.checkout.sessions.create({
       
     

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QC Inspection: ${productName}`,
              description: `Job ID: ${jobId} - Professional factory audit and AI report.`,
            },
            unit_amount: 9900, // $99.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/book-qc?canceled=true`,
      metadata: {
        jobId: jobId,
        clientId: clientId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (err: any) {
    console.error("Checkout API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}