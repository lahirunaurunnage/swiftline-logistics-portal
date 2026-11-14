
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { trackingNumber, courier } = await request.json();

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 });
    }

    // AfterShip API Request (මෙතැනදී AfterShip හෝ 17Track API Endpoint එකට රෙකෝඩ් එක යවනු ලැබේ)
    // නිදසුනක් ලෙස AfterShip API Free/Test Mock Response එකක් මෙහි දැක්වේ:
    
    // API Call එක සාර්ථක යැයි සිතමු:
    const trackingInfo = {
      tracking_number: trackingNumber,
      courier: courier || "SF Express",
      status: "In Transit",
      checkpoints: [
        { date: "2026-11-12", location: "Guangzhou Sorting Center", message: "Package picked up" },
        { date: "2026-11-13", location: "Guangzhou Export Customs", message: "Customs clearance completed" },
        { date: "2026-11-14", location: "In Flight / On Route", message: "Departed from Guangzhou Hub" }
      ]
    };

    return NextResponse.json({ success: true, data: trackingInfo });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}