"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function numberToWords(num: number): string {
  if (num === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  return convert(Math.round(num)) + " Rupees Only";
}

interface IncomeRecord {
  id: string;
  propertyId: string;
  amount: string;
  month: number;
  year: number;
  receivedDate: string | null;
  isReceived: boolean;
  tenantName: string | null;
  notes: string | null;
  propertyName: string | null;
  propertyAddress: string | null;
  propertyCity: string | null;
}

function ReceiptContent() {
  const searchParams = useSearchParams();
  const incomeId = searchParams.get("incomeId");

  const [data, setData] = useState<IncomeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!incomeId) {
      setError("No income ID provided.");
      setLoading(false);
      return;
    }

    fetch(`/api/rental-income/${incomeId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch income record");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load receipt data. Please try again."))
      .finally(() => setLoading(false));
  }, [incomeId]);

  useEffect(() => {
    if (!loading && !error && data) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, error, data]);

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
        <p>Loading receipt...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#dc2626" }}>
        <p>{error || "Receipt not found."}</p>
      </div>
    );
  }

  const amount = parseFloat(data.amount);
  const receiptNo = `RR-${data.id.substring(0, 8).toUpperCase()}`;
  const receivedDate = data.receivedDate
    ? new Date(data.receivedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const propertyAddress = [data.propertyAddress, data.propertyCity].filter(Boolean).join(", ");

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Georgia', 'Times New Roman', serif; background: white; color: #111; }
        .receipt-container {
          max-width: 700px;
          margin: 40px auto;
          padding: 48px;
          border: 2px solid #333;
          position: relative;
        }
        .receipt-container::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          bottom: 4px;
          border: 1px solid #999;
          pointer-events: none;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }
        .receipt-header h1 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 6px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .receipt-header p {
          font-size: 12px;
          color: #666;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .receipt-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
          font-size: 13px;
        }
        .receipt-meta .label {
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .receipt-meta .value {
          font-weight: 600;
          font-size: 14px;
        }
        .receipt-body {
          margin-bottom: 32px;
          line-height: 2;
          font-size: 14px;
        }
        .receipt-body .highlight {
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .amount-box {
          background: #f8f8f8;
          border: 1px solid #ddd;
          padding: 16px 24px;
          margin: 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .amount-box .amount-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #666;
        }
        .amount-box .amount-value {
          font-size: 24px;
          font-weight: 700;
        }
        .amount-words {
          font-size: 13px;
          color: #444;
          font-style: italic;
          margin-bottom: 32px;
          padding: 8px 0;
          border-bottom: 1px dashed #ccc;
        }
        .details-table {
          width: 100%;
          font-size: 13px;
          margin-bottom: 32px;
          border-collapse: collapse;
        }
        .details-table td {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .details-table td:first-child {
          color: #666;
          width: 160px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .details-table td:last-child {
          font-weight: 600;
          text-align: right;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 60px;
          padding-top: 20px;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #333;
          padding-top: 8px;
          font-size: 12px;
          color: #666;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          font-size: 11px;
          color: #999;
        }
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .receipt-container { margin: 0; border: 2px solid #333; max-width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="receipt-container">
        <div className="receipt-header">
          <h1>Rent Receipt</h1>
          <p>For HRA Tax Exemption</p>
        </div>

        <div className="receipt-meta">
          <div>
            <div className="label">Receipt No.</div>
            <div className="value">{receiptNo}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="label">Date</div>
            <div className="value">{receivedDate}</div>
          </div>
        </div>

        <div className="receipt-body">
          <p>
            Received with thanks from{" "}
            <span className="highlight">{data.tenantName || "Tenant"}</span>{" "}
            a sum of{" "}
            <span className="highlight">{formatCurrency(amount)}</span>{" "}
            towards rent for the month of{" "}
            <span className="highlight">{MONTHS[data.month]} {data.year}</span>.
          </p>
        </div>

        <div className="amount-box">
          <div className="amount-label">Amount Received</div>
          <div className="amount-value">{formatCurrency(amount)}</div>
        </div>

        <div className="amount-words">
          Amount in words: {numberToWords(amount)}
        </div>

        <table className="details-table">
          <tbody>
            <tr>
              <td>Property</td>
              <td>{data.propertyName || "—"}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>{propertyAddress || "—"}</td>
            </tr>
            <tr>
              <td>Tenant Name</td>
              <td>{data.tenantName || "—"}</td>
            </tr>
            <tr>
              <td>Period</td>
              <td>{MONTHS[data.month]} {data.year}</td>
            </tr>
            <tr>
              <td>Payment Status</td>
              <td>{data.isReceived ? "Received" : "Pending"}</td>
            </tr>
          </tbody>
        </table>

        <div className="signature-section">
          <div className="signature-box">
            <div style={{ height: "60px" }} />
            <div className="signature-line">Tenant Signature</div>
          </div>
          <div className="signature-box">
            <div style={{ height: "60px" }} />
            <div className="signature-line">Landlord Signature</div>
          </div>
        </div>

        <div className="footer">
          <p>This is a computer-generated receipt and does not require a physical signature.</p>
          <p style={{ marginTop: "4px" }}>Generated by BhoomiQ on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
        </div>
      </div>
    </>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
          <p>Loading...</p>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
