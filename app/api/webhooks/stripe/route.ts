 import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log("🔔 Webhook API hit!");
  
  const body = await req.text();
  const headersList = await headers();
const signature = headersList.get("Stripe-Signature") as string;
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
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name || "Valued Client";

    console.log("📦 Metadata received from Stripe:", metadata);

    if (metadata && metadata.product_name) {
      const newJobId = `QC-${Math.floor(1000 + Math.random() * 9000)}`;
      console.log("💾 Trying to save to Supabase...");
      
      const { error } = await supabaseAdmin.from("qc_jobs").insert([
        {
          job_id: newJobId,
          client_id: metadata.client_id,
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

      // 📧 ස්වයංක්‍රීයව Resend හරහා Client ට ඊමේල් යැවීම
      if (customerEmail) {
        try {
          await resend.emails.send({
            from: 'Swiftline Portal <onboarding@resend.dev>',
            to: [customerEmail],
            subject: `🎉 QC Order Confirmed: ${newJobId} - Swiftline Portal`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #ffffff; padding: 30px; border-radius: 15px;">
                <h2 style="color: #3b82f6;">Swiftline Sourcing & QC Portal</h2>
                <p>Hi ${customerName},</p>
                <p>We have successfully received your <b>$99 payment</b> via Stripe for your QC inspection.</p>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin: 20px 0;">
                  <p><b>Job ID:</b> ${newJobId}</p>
                  <p><b>Product Name:</b> ${metadata.product_name}</p>
                  <p><b>Quantity:</b> ${metadata.quantity} pcs</p>
                  <p><b>Status:</b> Awaiting Inspector</p>
                </div>
                <p>Our ground inspection team in China has been notified and will begin the inspection shortly.</p>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">Swiftline Global Operations © 2026</p>
              </div>
            `,
          });
          console.log(`📧 Success! Confirmation email sent to ${customerEmail}`);
        } catch (emailErr: any) {
          console.error("❌ Resend Email Error in Webhook:", emailErr.message);
        }
      }

    } else {
      console.log("⚠️ No metadata found. (Probably a CLI trigger test)");
    }
  }

  return new NextResponse("OK", { status: 200 });
}