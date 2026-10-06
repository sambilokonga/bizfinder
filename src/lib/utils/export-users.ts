/**
 * Modern User Export Utility
 * Supports CSV (Excel-ready with UTF-8 BOM and formula sanitization) and formatted JSON.
 */

export interface ExportUserRecord {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  country?: string;
  city?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string | Date;
  claimedBusinessIds?: string[];
  [key: string]: any;
}

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

function formatRoleName(role?: string): string {
  if (!role) return "User";
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "country_admin":
      return "Country Admin";
    case "city_admin":
      return "City Admin";
    case "admin":
      return "Administrator";
    case "owner":
      return "Business Owner";
    case "user":
    default:
      return "Customer";
  }
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
 * Generates and triggers browser download of users in CSV format.
 */
export function exportUsersToCSV(
  users: ExportUserRecord[],
  filenamePrefix = "globalbiz_users"
): void {
  const headers = [
    "User ID",
    "Full Name",
    "Email Address",
    "Phone Number",
    "Role",
    "Country",
    "City / Municipality",
    "Account Status",
    "Date Registered",
    "Claimed Businesses Count",
  ];

  const rows = users.map((u) => {
    const status =
      u.status || (u.isActive === false ? "Suspended" : "Active");
    const country = u.country || u.assignedCountry || "Global";
    const city = u.city || u.assignedCity || "—";
    const claimedCount = Array.isArray(u.claimedBusinessIds)
      ? u.claimedBusinessIds.length
      : 0;

    return [
      escapeCSVField(u.id || u.clerkId || ""),
      escapeCSVField(u.name || ""),
      escapeCSVField(u.email || ""),
      escapeCSVField(u.phone || "—"),
      escapeCSVField(formatRoleName(u.role)),
      escapeCSVField(country),
      escapeCSVField(city),
      escapeCSVField(status),
      escapeCSVField(formatDate(u.createdAt)),
      escapeCSVField(claimedCount),
    ].join(",");
  });

  // UTF-8 Byte Order Mark (BOM) ensures Microsoft Excel properly renders non-ASCII characters
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filenamePrefix}_${getTimestampStr()}.csv`);
}

/**
 * Generates and triggers browser download of users in JSON format.
 */
export function exportUsersToJSON(
  users: ExportUserRecord[],
  filenamePrefix = "globalbiz_users"
): void {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    totalRecords: users.length,
    users: users.map((u) => ({
      id: u.id || u.clerkId,
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || null,
      role: u.role || "user",
      roleLabel: formatRoleName(u.role),
      country: u.country || u.assignedCountry || "Global",
      city: u.city || u.assignedCity || null,
      status: u.status || (u.isActive === false ? "suspended" : "active"),
      createdAt: u.createdAt,
      claimedBusinessCount: Array.isArray(u.claimedBusinessIds)
        ? u.claimedBusinessIds.length
        : 0,
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
