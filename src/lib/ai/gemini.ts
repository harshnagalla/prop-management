import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

// --- Zod Schemas ---

const billDataSchema = z.object({
  amount: z.number().optional().describe("Total bill amount"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  category: z
    .enum([
      "electricity",
      "water",
      "municipal_tax",
      "maintenance",
      "insurance",
      "repair",
      "legal",
      "other",
    ])
    .optional()
    .describe("Bill category"),
  vendor: z.string().optional().describe("Company or vendor name"),
  referenceNumber: z
    .string()
    .optional()
    .describe("Bill or receipt number"),
  propertyHint: z
    .string()
    .optional()
    .describe("Any address or property identifier visible on the bill"),
  lineItems: z
    .array(z.object({ description: z.string(), amount: z.number() }))
    .optional()
    .describe("Itemized line items"),
});

const spreadsheetDataSchema = z.object({
  properties: z
    .array(
      z.object({
        name: z.string().describe("Property name or identifier"),
        address: z.string().optional(),
        type: z
          .enum(["residential", "commercial", "industrial", "land", "mixed"])
          .optional(),
        purchasePrice: z.number().optional(),
        currentValue: z.number().optional(),
        monthlyRent: z.number().optional(),
        tenantName: z.string().optional(),
        area: z.number().optional().describe("Area in sqft"),
      })
    )
    .optional(),
});

// --- Retry Helper ---

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`AI extraction failed after ${maxRetries + 1} attempts`);
}

// --- Extraction Functions ---

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
  const { object } = await withRetry(() =>
    generateObject({
      model: google("gemini-2.0-flash"),
      schema: billDataSchema,
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
              text: `Extract bill/receipt information from this document.

Indian utility provider recognition:
- Torrent Power, UGVCL, DGVCL, MGVCL, PGVCL → category: "electricity"
- AMC, Ahmedabad Municipal Corporation, any municipal/nagarpalika → category: "municipal_tax"
- GWSSB, water supply board, jal board → category: "water"

Amount handling:
- Read amounts in Indian numbering system (lakhs = 100,000; crores = 10,000,000)
- Strip ₹ symbol, "Rs.", commas before returning the number

Reference number:
- Look for GSTIN, consumer number, account number, bill number, or receipt number

Date handling:
- Indian bills commonly use DD/MM/YYYY format — convert to YYYY-MM-DD
- Also handle DD-MM-YYYY, DD.MM.YYYY, and written dates

Extract all visible line items with their descriptions and amounts.
Include any address or property identifier as propertyHint.`,
            },
          ],
        },
      ],
    })
  );

  return object;
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
  const { object } = await withRetry(() =>
    generateObject({
      model: google("gemini-2.0-flash"),
      schema: spreadsheetDataSchema,
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
              text: `Extract all property data from this spreadsheet/document.

Amount handling:
- Strip ₹ symbol, "Rs.", "INR", and commas from all monetary values
- Convert lakhs/crores to full numbers (e.g., "25 lakhs" → 2500000)
- Return all amounts as plain numbers

Property type normalization:
- Residential / House / Flat / Apartment → "residential"
- Commercial / Shop / Office / Showroom → "commercial"
- Industrial / Factory / Warehouse / Godown → "industrial"
- Land / Plot / Farm → "land"
- Mixed use → "mixed"

Area: convert to sqft if possible. Return as a number.
Extract every property row found in the document.`,
            },
          ],
        },
      ],
    })
  );

  return object;
}
