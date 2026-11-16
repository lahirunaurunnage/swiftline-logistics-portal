 import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log("🔔 Webhook API hit!"); // මැසේජ් එක ආපු ගමන් මේක වැටෙයි
  
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log("✅ Signature verified! Event Type:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook Signature Error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    console.log("📦 Metadata received from Stripe:", metadata); // ආපු ඩේටා ටික මෙතන පෙන්නයි

    // Metadata තියෙනවද කියලා බලනවා (trigger කමාන්ඩ් එකෙන් කරොත් මේවා එන්නේ නෑ)
    if (metadata && metadata.product_name) {
      const newJobId = `QC-${Math.floor(1000 + Math.random() * 9000)}`;
      console.log("💾 Trying to save to Supabase...");
      
      const { error } = await supabaseAdmin.from("qc_jobs").insert([
        {
          job_id: newJobId,
          client_id: metadata.client_id, // මේක අවුල් නම් පල්ලෙහා Error එක වැටෙයි
          product_name: metadata.product_name,
          supplier_contact: metadata.supplier_contact,
          quantity: parseInt(metadata.quantity || "0"),
          location: metadata.location,
          special_notes: metadata.special_notes,
          status: "Awaiting Inspector",
        },
      ]);

      if (error) {
        console.error("❌ Supabase Database Error:", error);
        return new NextResponse("Database Error", { status: 500 });
      }
      
      console.log(`✅ Success! Order ${newJobId} saved to database.`);
    } else {
      console.log("⚠️ No metadata found. (Probably a CLI trigger test)");
    }
  }

  return new NextResponse("OK", { status: 200 });
}