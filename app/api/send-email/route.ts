
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend API Key එක .env.local එකෙන් ලබා ගනී
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { toEmail, subject, message } = await request.json();

    const data = await resend.emails.send({
      from: 'Swiftline WMS <onboarding@resend.dev>', // Free tier වලදී resend.dev ඩොමේන් එක පාවිච්චි කළ හැක
      to: [toEmail],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; background: #0B1120; color: #fff; padding: 30px; border-radius: 15px;">
          <h2 style="color: #3b82f6;">Swiftline Holdings Notification</h2>
          <p style="font-size: 16px; color: #cbd5e1;">${message}</p>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Guangzhou Central Warehouse Operations | Swiftline WMS</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}