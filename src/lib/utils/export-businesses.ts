/**
 * Modern Business Export Utility
 * Supports CSV (Excel-ready with UTF-8 BOM, sanitized fields, comprehensive columns) and formatted JSON.
 */

import { Business } from "@/types/business";

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
    return d.toISOString().split("T")[0];
  } catch {
    return String(dateValue);
  }
}

/**
 * Generates and triggers browser download of businesses in CSV format.
 */
export function exportBusinessesToCSV(
  businesses: Business[],
  filenamePrefix = "globalbiz_businesses"
): void {
  const headers = [
    "Business ID",
    "Business Name",
    "Category",
    "Subcategory",
    "Country",
    "City",
    "District / Subcity",
    "Address",
    "Phone",
    "Email",
    "Website",
    "Status",
    "Approval Status",
    "Verified",
    "Featured",
    "Rating Avg",
    "Review Count",
    "Views Count",
    "Branches Count",
    "Created Date",
  ];

  const rows = businesses.map((b) => {
    const bAny = b as any;
    const country = b.countryName || bAny.country || "Global";
    const city = b.cityName || bAny.city || "—";
    const district = b.districtName || bAny.subcityId || bAny.subcityName || "—";
    const isVer = b.isVerified ? "Yes" : "No";
    const isFeat = b.isFeatured ? "Yes" : "No";
    const rating = typeof b.ratingAvg === "number" ? b.ratingAvg.toFixed(1) : "0.0";
    const reviews = b.reviewCount ?? 0;
    const views = b.viewCount ?? 0;
    const branches = b.branchesCount ?? (Array.isArray(b.branches) ? b.branches.length : 0);

    return [
      escapeCSVField(b.id || ""),
      escapeCSVField(b.name || ""),
      escapeCSVField(b.categoryName || bAny.category || ""),
      escapeCSVField(b.subcategoryName || bAny.subcategory || ""),
      escapeCSVField(country),
      escapeCSVField(city),
      escapeCSVField(district),
      escapeCSVField(b.addressLine || ""),
      escapeCSVField(b.telephone || b.mobile || bAny.phone || "—"),
      escapeCSVField(b.email || "—"),
      escapeCSVField(b.website || "—"),
      escapeCSVField(b.status || "active"),
      escapeCSVField(b.approvalStatus || (b.isApproved ? "approved" : "pending")),
      escapeCSVField(isVer),
      escapeCSVField(isFeat),
      escapeCSVField(rating),
      escapeCSVField(reviews),
      escapeCSVField(views),
      escapeCSVField(branches),
      escapeCSVField(formatDate(b.createdAt)),
    ].join(",");
  });

  // UTF-8 Byte Order Mark (BOM) ensures Microsoft Excel properly renders non-ASCII characters
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filenamePrefix}_${getTimestampStr()}.csv`);
}

/**
 * Generates and triggers browser download of businesses in JSON format.
 */
export function exportBusinessesToJSON(
  businesses: Business[],
  filenamePrefix = "globalbiz_businesses"
): void {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    totalRecords: businesses.length,
    businesses: businesses.map((b) => {
      const bAny = b as any;
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        category: b.categoryName || bAny.category || null,
        categoryId: b.categoryId || null,
        subcategory: b.subcategoryName || bAny.subcategory || null,
        country: b.countryName || bAny.country || "Global",
        city: b.cityName || bAny.city || null,
        district: b.districtName || bAny.subcityId || bAny.subcityName || null,
        address: b.addressLine || null,
        phone: b.telephone || b.mobile || bAny.phone || null,
        email: b.email || null,
        website: b.website || null,
        status: b.status || "active",
        approvalStatus: b.approvalStatus || (b.isApproved ? "approved" : "pending"),
        isVerified: Boolean(b.isVerified),
        isFeatured: Boolean(b.isFeatured),
        ratingAvg: b.ratingAvg || 0,
        reviewCount: b.reviewCount || 0,
        viewCount: b.viewCount || 0,
        branchesCount: b.branchesCount ?? (Array.isArray(b.branches) ? b.branches.length : 0),
        coordinates: b.latitude && b.longitude ? { lat: b.latitude, lng: b.longitude } : null,
        createdAt: b.createdAt || null,
      };
    }),
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
