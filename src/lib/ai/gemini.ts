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

// --- Smart Property Import Schema ---

const smartImportSchema = z.object({
  properties: z.array(z.object({
    name: z.string().describe("Property/building name"),
    unitNumber: z.string().optional().describe("Unit/shop/flat/shed number if this is a unit within a building (e.g. 'UNIT 127', 'SHED-74', 'FF-106', '301')"),
    buildingName: z.string().describe("Parent building name without unit number (e.g. 'GALLERIA', 'AAROHI VERVE', 'SHUBHAM INDUSTRIAL PARK')"),
    address: z.string().describe("Full address"),
    city: z.string().optional().describe("City name, default Ahmedabad"),
    area: z.string().optional().describe("Area in locality (e.g. 'Bopal', 'Narol', 'Bodakdev', 'SG Highway')"),
    type: z.enum(["residential", "commercial", "industrial", "land", "mixed"]).describe("Property type"),
    areaDetails: z.string().optional().describe("Area measurements as-is from source (carpet, built-up, land area with units)"),
    dastavejNo: z.string().optional().describe("Dastavej/deed registration number"),
    registrationDate: z.string().optional().describe("Registration date in YYYY-MM-DD format"),
    propertyValue: z.number().optional().describe("Property value / purchase price in INR"),
    stampDuty: z.number().optional().describe("Stamp duty amount in INR"),
    registrationCharges: z.number().optional().describe("Registration charges in INR"),
    totalCost: z.number().optional().describe("Total cost including all charges in INR"),
    ownership: z.string().optional().describe("Ownership description (e.g. '50% Siva, 50% NMP')"),
    ownershipPercent: z.number().optional().describe("The user's ownership percentage (0-100)"),
    remarks: z.string().optional().describe("Any remarks or notes"),
  })),
  buildingGroups: z.array(z.object({
    buildingName: z.string(),
    unitCount: z.number(),
    propertyIndices: z.array(z.number()).describe("Indices into the properties array that belong to this building"),
  })).describe("Buildings that have multiple units"),
});

export async function smartImportProperties(
  csvText: string,
  existingProperties?: Array<{ name: string; address: string }>
): Promise<z.infer<typeof smartImportSchema>> {
  const existingContext = existingProperties && existingProperties.length > 0
    ? `\n\nEXISTING PROPERTIES ALREADY IN DATABASE:\n${existingProperties.map((p, i) => `${i + 1}. "${p.name}" at "${p.address}"`).join("\n")}\n\nFor each imported property, check if it's the SAME property (same building AND same unit) as any existing one. Different units in the same building are SEPARATE properties.`
    : "";

  const { object } = await withRetry(() =>
    generateObject({
      model: google("gemini-2.0-flash"),
      schema: smartImportSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a property data extraction expert for Indian real estate.

Parse this property spreadsheet and extract ALL properties with ALL financial details.

CRITICAL RULES FOR FINANCIAL DATA:
- "Property Value" or "Purchase Price" column = propertyValue field. This is usually the LARGEST number (lakhs range). Example: 1205450, 2450000, 5180000
- "Stamp Duty" column = stampDuty field. Usually 1-5% of property value. Example: 9930, 120100, 253825
- "Registration Charges" column = registrationCharges field. Usually small. Example: 1950, 24625, 52025
- "Total Cost" column = totalCost field. Should equal propertyValue + stampDuty + registrationCharges
- NEVER confuse stamp duty with property value. Property value is always the biggest number.
- Remove ₹ symbols, "Rs.", commas, quotes from numbers. "₹1,205,450" → 1205450
- If a number is in quotes like "1,205,450", strip quotes and commas.

CRITICAL RULES FOR PROPERTIES:
1. Each ROW = one separate property. Same building name with different rows = different units.
2. Extract UNIT NUMBER from address: "UNIT 127", "SHED-74", "FF-106", "301", "B-1001", "TF-3024", "FF-SHOP-105"
3. "BLOCK NO A 1ST FLOOR, UNIT 127" → unit is "UNIT 127", NOT "A 1"
4. "301, AAROHI VERVE COMMERCIAL" → unit is "301", building is "AAROHI VERVE"
5. Group properties sharing the same building name.
6. Dates: DD-Mon-YYYY or DD/MM/YYYY → YYYY-MM-DD
7. Ownership "50%Siva 50% nmp" → ownershipPercent: 50. "100% Siva" → 100.
8. Skip header rows, title rows, total/summary rows.
${existingContext}

SPREADSHEET DATA:
${csvText}`,
            },
          ],
        },
      ],
    })
  );
  return object;
}

// --- Bank Statement Schema ---

const bankTransactionSchema = z.object({
  transactions: z.array(z.object({
    date: z.string().describe("Transaction date in YYYY-MM-DD format"),
    description: z.string().describe("Transaction narration/description"),
    amount: z.number().describe("Absolute transaction amount"),
    type: z.enum(["credit", "debit"]).describe("Credit (money received) or Debit (money paid)"),
    category: z.enum(["rent_received", "electricity", "water", "municipal_tax", "maintenance", "insurance", "repair", "transfer", "other"]).optional().describe("Auto-detected category"),
    possibleProperty: z.string().optional().describe("Property name this might relate to"),
  })),
});

export async function extractBankTransactions(
  base64File: string,
  mimeType: string
): Promise<z.infer<typeof bankTransactionSchema>> {
  const { object } = await withRetry(() =>
    generateObject({
      model: google("gemini-2.0-flash"),
      schema: bankTransactionSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "file", data: base64File, mediaType: mimeType },
            {
              type: "text",
              text: `Extract all transactions from this Indian bank statement.

For each transaction detect:
- Date: convert any format (DD/MM/YYYY, DD-MM-YY) to YYYY-MM-DD
- Description: the narration/description text
- Amount: the absolute amount (no negatives)
- Type: "credit" if money was received, "debit" if money was paid out
- Category: auto-detect:
  - "rent_received" for rent payments, NEFT/IMPS credits mentioning rent or tenant names
  - "electricity" for Torrent Power, UGVCL, DGVCL, MGVCL, PGVCL
  - "water" for GWSSB, water board
  - "municipal_tax" for AMC, municipal corporation, property tax
  - "maintenance" for society maintenance, association fees
  - "insurance" for insurance premiums
  - "repair" for repair, plumbing, electrician
  - "transfer" for account transfers, self-transfers
  - "other" for everything else
- possibleProperty: if the description mentions a property name, address, or flat/shed number

Handle Indian bank formats (SBI, HDFC, ICICI, Kotak, Axis).
Handle UPI, NEFT, RTGS, IMPS transactions.
Ignore balance columns — only extract transaction amounts.
Convert Indian date formats (DD/MM/YYYY) to YYYY-MM-DD.`,
            },
          ],
        },
      ],
    })
  );
  return object;
}
