 import { NextResponse } from 'next/server';
import EasyPost from '@easypost/api';

// EasyPost API Key එක .env.local එකෙන් ලබා ගනී
const api = new EasyPost(process.env.EASYPOST_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { weightKg, destinationCountry, toAddress } = await request.json();

    if (!weightKg || !destinationCountry) {
      return NextResponse.json({ success: false, error: "Weight and destination country are required." }, { status: 400 });
    }

    // 1. EasyPost Shipment එකක් නිර්මාණය කිරීම (China Warehouse සිට Client ගේ රටට)
    const shipment = await api.Shipment.create({
      from_address: {
        street: 'No. 123, Guangzhou Logistics Park',
        city: 'Guangzhou',
        state: 'GD',
        zip: '510000',
        country: 'CN',
      },
      to_address: {
        street: toAddress?.street || '123 Main St',
        city: toAddress?.city || 'New York',
        state: toAddress?.state || 'NY',
        zip: toAddress?.zip || '10001',
        country: destinationCountry, // උදා: 'US', 'GB', 'LK'
      },
      parcel: {
        weight: weightKg * 35.274, // KG වලින් එන බර Ounces වලට හැරවීම (EasyPost අවශ්‍යතාවය)
      },
    });

    // 2. කුරියර් සමාගම් වලින් ලැබුණු සැබෑ Rates (Dealer Rates) ලබා ගැනීම
    const rates = shipment.rates;

    // 3. අපේ ඩීලර් මාර්ජින් එක (Dealer Margin / Arbitrage) එකතු කර පාරිභෝගිකයාට මිල ගණන් සැකසීම
    const formattedRates = rates.map((rate: any) => {
      const baseCost = parseFloat(rate.rate); // කුරියර් සමාගම අය කරන මූලික ඩීලර් ගාණ
      
      // අපේ ලාභය තබා වෙළඳපොළට වඩා අඩු මිලක් සකස් කිරීම (උදා: 20% මාර්ජින් එකක් සමඟ)
      const customerPrice = (baseCost * 1.20).toFixed(2); 

      return {
        serviceId: rate.id,
        carrier: rate.carrier, // උදා: DHL, FedEx, UPS
        serviceName: rate.service, // උදා: Express, Priority
        estimatedDays: rate.delivery_days || "3-5",
        baseCost: baseCost,
        customerPrice: parseFloat(customerPrice),
      };
    });

    return NextResponse.json({
      success: true,
      shipmentId: shipment.id,
      rates: formattedRates,
    });

  } catch (error: any) {
    console.error("EasyPost API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch shipping rates." }, { status: 500 });
  }
}