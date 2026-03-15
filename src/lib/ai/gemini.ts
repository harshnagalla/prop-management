import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

export async function extractBillData(
  base64Image: string,
  mimeType: string
): Promise<{
  amount?: number;
  date?: string;
  category?: string;
  vendor?: string;
  referenceNumber?: string;
  propertyHint?: string;
  lineItems?: Array<{ description: string; amount: number }>;
}> {
  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: base64Image,
            mediaType: mimeType,
          },
          {
            type: "text",
            text: `Extract the following information from this bill/receipt image. Return ONLY valid JSON with these fields:
{
  "amount": <total amount as number>,
  "date": "<date in YYYY-MM-DD format>",
  "category": "<one of: electricity, water, municipal_tax, maintenance, insurance, repair, legal, other>",
  "vendor": "<company/vendor name>",
  "referenceNumber": "<bill/receipt number if visible>",
  "propertyHint": "<any address or property identifier visible on the bill>",
  "lineItems": [{"description": "<item>", "amount": <number>}]
}

If a field is not found, omit it. For Indian bills, look for:
- Torrent Power / UGVCL → electricity
- AMC / Ahmedabad Municipal Corporation → municipal_tax
- Water supply bills → water
Return ONLY the JSON, no markdown or explanation.`,
          },
        ],
      },
    ],
  });

  const cleaned = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

export async function extractSpreadsheetData(
  base64File: string,
  mimeType: string
): Promise<{
  properties?: Array<{
    name: string;
    address?: string;
    type?: string;
    purchasePrice?: number;
    currentValue?: number;
    monthlyRent?: number;
    tenantName?: string;
    area?: number;
  }>;
}> {
  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: base64File,
            mediaType: mimeType,
          },
          {
            type: "text",
            text: `This is a spreadsheet/document containing property data. Extract all properties into this JSON format:
{
  "properties": [
    {
      "name": "<property name/identifier>",
      "address": "<full address>",
      "type": "<residential|commercial|industrial|land|mixed>",
      "purchasePrice": <number>,
      "currentValue": <number>,
      "monthlyRent": <number or null if not rented>,
      "tenantName": "<tenant name if available>",
      "area": <area in sqft as number>
    }
  ]
}
Return ONLY valid JSON. Convert all amounts to numbers (remove ₹, commas, etc).`,
          },
        ],
      },
    ],
  });

  const cleaned = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    return { properties: [] };
  }
}
