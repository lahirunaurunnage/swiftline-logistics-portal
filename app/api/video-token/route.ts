import { NextResponse } from 'next/server';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

export async function POST(request: Request) {
  try {
    const { identity, roomName } = await request.json();

    if (!identity || !roomName) {
      return NextResponse.json({ error: "Identity and roomName are required" }, { status: 400 });
    }

    // Twilio Credentials (.env.local එකෙන් ලබා ගනී)
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;

    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret) {
      return NextResponse.json({ error: "Twilio credentials not configured in environment variables" }, { status: 500 });
    }

    // Create Video Grant
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    // Create Access Token
    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity }
    );

    token.addGrant(videoGrant);

    return NextResponse.json({ success: true, token: token.toJwt() });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}