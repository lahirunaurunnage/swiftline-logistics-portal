 import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { type, recipientEmail, recipientName, jobDetails } = await request.json();

    let subject = "";
    let htmlContent = "";

    // 1. Inspector ට අලුත් ජොබ් එකක් ලැබුණම යවන ඊමේල් එක
    if (type === "NEW_JOB_INSPECTOR") {
      subject = `🚨 New Factory Inspection Available: ${jobDetails.jobId} ($40 Payout)`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #ffffff; padding: 30px; border-radius: 15px;">
          <h2 style="color: #a855f7;">Inspector Hub Alert 🕵️‍♂️</h2>
          <p>Hello Inspector,</p>
          <p>A new factory QC job has been posted and is available for your application.</p>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><b>Job ID:</b> ${jobDetails.jobId}</p>
            <p><b>Product Name:</b> ${jobDetails.productName}</p>
            <p><b>Quantity:</b> ${jobDetails.quantity} pcs</p>
            <p><b>Location:</b> ${jobDetails.location || 'China Factory'}</p>
            <p><b>Guaranteed Payout:</b> $40.00</p>
          </div>
          <p>Log in to your Inspector Portal now to accept this assignment.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">Swiftline Global Operations © 2026</p>
        </div>
      `;
    } 
    
    // 2. AI Report එක සූදානම් වුණාම Client ට යවන ඊමේල් එක
    else if (type === "REPORT_READY") {
      subject = `📄 AI QC Report Ready & Approved for ${jobDetails.jobId}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #ffffff; padding: 30px; border-radius: 15px;">
          <h2 style="color: #10b981;">QC Inspection Completed! 🎉</h2>
          <p>Hi ${recipientName || 'Valued Client'},</p>
          <p>Your AI-driven Quality Control inspection report for <b>${jobDetails.productName}</b> is now ready for review.</p>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><b>Job ID:</b> ${jobDetails.jobId}</p>
            <p><b>Status:</b> Report Ready</p>
          </div>
          <p style="margin: 25px 0;">
            <a href="${jobDetails.reportUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Final AI Report PDF</a>
          </p>
          <p>Log in to your Client Dashboard to inspect the photos, review notes, and click <b>"Approve & Ship"</b>.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">Swiftline Global Operations © 2026</p>
        </div>
      `;
    } else {
      return NextResponse.json({ success: false, error: "Invalid notification type." }, { status: 400 });
    }

    // Resend හරහා ඊමේල් යැවීම
    const data = await resend.emails.send({
      from: 'Swiftline Portal <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Notification Email API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}