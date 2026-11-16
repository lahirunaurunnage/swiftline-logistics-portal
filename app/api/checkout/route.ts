 import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe කනෙක්ෂන් එක
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Supabase කනෙක්ෂන් එක (Database එකට ලියන්න Service Role Key එක පාවිච්චි කරනවා)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productName, supplierContact, quantity, location, specialNotes, clientId } = body;

    // 1. අලුත් Job ID එකක් හදනවා
    const newJobId = `QC-${Math.floor(1000 + Math.random() * 9000)}`;

    console.log("💾 Saving to Supabase before checkout...");

    // 2. Stripe එකට යන්න කලින් කෙලින්ම Supabase එකට ඩේටා ටික සේව් කරනවා!
    const { error: dbError } = await supabase.from("qc_jobs").insert([
      {
        job_id: newJobId,
        client_id: clientId,
        product_name: productName,
        supplier_contact: supplierContact,
        quantity: parseInt(quantity || "0"),
        location: location,
        special_notes: specialNotes,
        status: "Awaiting Inspector", // කෙලින්ම අලුත් ඕඩර් එකක් විදිහට ඇඩ් වෙනවා
      },
    ]);

    if (dbError) {
      console.error("❌ Supabase Insert Error:", dbError);
      return NextResponse.json({ error: "Failed to save order to database" }, { status: 500 });
    }

    console.log(`✅ Order ${newJobId} saved successfully! Redirecting to Stripe...`);

    // 3. ඩේටා සේව් වුණාට පස්සේ Stripe Payment පිටුව හදනවා
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Smart QC: ${productName}`,
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      // (දැන් Webhook නැති නිසා Metadata යවන්න ඕනේ නෑ, ඒ කෑල්ල අයින් කරලා තියෙන්නේ)
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}