/**
 * Modern Payment / Transaction Export Utility
 * Supports CSV (Excel-compatible with UTF-8 BOM, sanitized fields) and formatted JSON.
 */

import { IPayment } from "@/types/payment";

function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Security: prevent CSV formula injection in spreadsheet software
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

function formatDate(dateValue?: string | Date): string {
  if (!dateValue) return "";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return d.toISOString().replace("T", " ").substring(0, 19);
  } catch {
    return String(dateValue);
  }
}

/**
 * Generates and triggers browser download of payments in CSV format.
 */
export function exportPaymentsToCSV(
  payments: IPayment[],
  filenamePrefix = "globalbiz_payments"
): void {
  const headers = [
    "Transaction ID",
    "Business Name",
    "Country",
    "City / Municipality",
    "Payer Name",
    "Payer Email",
    "Payer Phone",
    "Amount",
    "Currency",
    "Payment Method",
    "Payment Type",
    "Payment Status",
    "Reference Code",
    "Description",
    "Registered By",
    "Date & Time (UTC)",
  ];

  const rows = payments.map((p) => {
    return [
      escapeCSVField(p.id),
      escapeCSVField(p.businessName),
      escapeCSVField(p.countryName || "Ethiopia"),
      escapeCSVField(p.cityName || "Addis Ababa"),
      escapeCSVField(p.payerName),
      escapeCSVField(p.payerEmail || "—"),
      escapeCSVField(p.payerPhone || "—"),
      escapeCSVField(p.amount),
      escapeCSVField(p.currency),
      escapeCSVField(p.provider.toUpperCase().replace("_", " ")),
      escapeCSVField(p.paymentType.replace("_", " ")),
      escapeCSVField(p.status.toUpperCase()),
      escapeCSVField(p.reference || "—"),
      escapeCSVField(p.description || "—"),
      escapeCSVField(p.registeredBy || "System"),
      escapeCSVField(formatDate(p.createdAt)),
    ].join(",");
  });

  // UTF-8 Byte Order Mark (BOM) ensures Microsoft Excel and spreadsheet tools properly render non-ASCII characters
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filenamePrefix}_${getTimestampStr()}.csv`);
}

/**
 * Generates and triggers browser download of payments in JSON format.
 */
export function exportPaymentsToJSON(
  payments: IPayment[],
  filenamePrefix = "globalbiz_payments"
): void {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    totalRecords: payments.length,
    payments: payments.map((p) => ({
      id: p.id,
      businessId: p.businessId || null,
      businessName: p.businessName,
      country: p.countryName || "Ethiopia",
      city: p.cityName || "Addis Ababa",
      payerName: p.payerName,
      payerEmail: p.payerEmail || null,
      payerPhone: p.payerPhone || null,
      amount: p.amount,
      currency: p.currency,
      provider: p.provider,
      paymentType: p.paymentType,
      status: p.status,
      reference: p.reference || null,
      description: p.description || null,
      registeredBy: p.registeredBy || "System",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  };

  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, `${filenamePrefix}_${getTimestampStr()}.json`);
}

function getTimestampStr(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${min}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
