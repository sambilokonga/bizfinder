"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";

interface UploadBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedBusinessRow {
  name: string;
  categoryName: string;
  cityName: string;
  countryName: string;
  districtName?: string;
  addressLine?: string;
  phone?: string;
  email?: string;
  website?: string;
  priceTier?: string;
  businessType?: string;
  description?: string;
  isValid: boolean;
  errors: string[];
}

const SAMPLE_CSV = `name,categoryName,cityName,countryName,districtName,addressLine,phone,email,website,priceTier,businessType,description
"Aura Modern Bistro","Restaurants & Dining","Addis Ababa","Ethiopia","Bole","Namibia St, Near Edna Mall","+251911223344","contact@aurabistro.com","https://aurabistro.et","$$$","Private Company","Artisan fusion dining with live Ethiopian jazz nights."
"Zenith Tech Hub & Coworking","Professional Services","Addis Ababa","Ethiopia","Kazanchis","Yeka Subcity, Tito St","+251911556677","hello@zenithhub.et","https://zenithhub.et","$$","PLC","Premium collaborative workspace and incubation center."
"Blue Nile Safari Lodge","Hotels & Travel","Bahir Dar","Ethiopia","Lakeside","Lake Tana Shoreline Road","+251918334455","booking@bluenilelodge.com","","$$$$","Share Company","Eco-luxury resort lodge overlooking Lake Tana."`;

export function UploadBusinessModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadBusinessModalProps) {
  const { currentRole, currentUser } = useCurrentRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedBusinessRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    count: number;
    notificationsDispatched: number;
  } | null>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bizfinder_business_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample CSV template downloaded!");
  };

  const parseCSVText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      toast.error("File appears to be empty or has no header row.");
      return;
    }

    // Simple robust CSV line splitter taking quotes into account
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(cur.trim().replace(/^["']|["']$/g, ""));
          cur = "";
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^["']|["']$/g, ""));
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
    const rows: ParsedBusinessRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = values[idx] || "";
      });

      const name = record.name || record.businessname || record.title || "";
      const categoryName = record.categoryname || record.category || "General Business";
      const cityName = record.cityname || record.city || "Addis Ababa";
      const countryName = record.countryname || record.country || "Ethiopia";
      const districtName = record.districtname || record.subcity || record.district || "";
      const addressLine = record.addressline || record.address || `${cityName}, ${countryName}`;
      const phone = record.phone || record.telephone || record.mobile || "";
      const email = record.email || "";
      const website = record.website || record.url || "";
      const priceTier = record.pricetier || "$$";
      const businessType = record.businesstype || "Private Company";
      const description = record.description || record.about || `${name} in ${cityName}`;

      const errors: string[] = [];
      if (!name) errors.push("Missing business name");
      if (!cityName) errors.push("Missing city");
      if (!countryName) errors.push("Missing country");

      rows.push({
        name,
        categoryName,
        cityName,
        countryName,
        districtName,
        addressLine,
        phone,
        email,
        website,
        priceTier,
        businessType,
        description,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedRows(rows);
    if (rows.length > 0) {
      const validCount = rows.filter((r) => r.isValid).length;
      toast.success(`Parsed ${rows.length} rows (${validCount} valid)!`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(content);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const formatted: ParsedBusinessRow[] = list.map((item: any) => {
            const errors: string[] = [];
            if (!item.name) errors.push("Missing name");
            return {
              name: item.name || "",
              categoryName: item.categoryName || item.category || "General Business",
              cityName: item.cityName || item.city || "Addis Ababa",
              countryName: item.countryName || item.country || "Ethiopia",
              districtName: item.districtName || item.subcity || "",
              addressLine: item.addressLine || `${item.cityName || "City"}, ${item.countryName || "Country"}`,
              phone: item.telephone || item.phone || "",
              email: item.email || "",
              website: item.website || "",
              priceTier: item.priceTier || "$$",
              businessType: item.businessType || "Private Company",
              description: item.description || "",
              isValid: errors.length === 0,
              errors,
            };
          });
          setParsedRows(formatted);
          toast.success(`Parsed ${formatted.length} listings from JSON!`);
        } catch {
          toast.error("Invalid JSON file format.");
        }
      } else {
        parseCSVText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) {
      toast.error("No valid listings to upload. Please correct rows or check headers.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const payload = {
        businesses: validItems,
        ownerId: currentUser?.id || `user_uploader_${Date.now()}`,
        ownerName: currentUser?.name || "Business Submitter",
        ownerEmail: currentUser?.email,
      };

      setUploadProgress(50);
      const res = await fetch("/api/businesses/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setUploadProgress(90);
      const data = await res.json();

      if (res.ok && data.success) {
        setUploadProgress(100);
        setUploadResult({
          count: data.count,
          notificationsDispatched: data.notificationsDispatched || data.count * 3,
        });

        toast.success("Upload Successful!", {
          description: `${data.count} business listings created. Confirmation notifications sent to Super Admin, Country Admin, and City Admin!`,
          duration: 6000,
        });

        onSuccess?.();
      } else {
        toast.error("Upload Failed", {
          description: data.error || "Unable to save uploaded businesses.",
        });
      }
    } catch (err: any) {
      toast.error("Upload Error", {
        description: err.message || "Failed to reach server.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setRawFile(null);
    setParsedRows([]);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[94vw] max-w-3xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl sm:rounded-3xl bg-background border border-border/80 shadow-2xl my-auto">
        <DialogHeader className="p-4 xs:p-5 sm:p-6 border-b border-border/60 bg-muted/20 shrink-0 pr-12 sm:pr-16 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    Batch Upload Business Listings
                  </DialogTitle>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                    CSV • Excel • JSON
                  </Badge>
                </div>
                <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                  Upload multiple business listings with immediate confirmation alerts for Super Admin, Country Admin, and City Admin.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="text-xs gap-1.5 font-semibold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 h-8 w-full sm:w-auto justify-center"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Sample Template</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 xs:p-5 sm:p-6 space-y-4 sm:space-y-6">
          {uploadResult ? (
            /* ── SUCCESS RESULT SCREEN ── */
            <div className="p-5 sm:p-8 text-center space-y-3.5 sm:space-y-4 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {uploadResult.count} Businesses Uploaded Successfully!
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  All listings have been queued with status <strong>Pending Confirmation</strong>. Multi-tier confirmation notifications were dispatched:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-left max-w-lg mx-auto pt-2">
                <div className="p-2.5 sm:p-3 rounded-xl border border-purple-500/30 bg-purple-500/10">
                  <div className="font-bold text-purple-600 dark:text-purple-400">👑 Super Admin</div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Global Confirmation Alert sent</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">🌍 Country Admin</div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">National Verification Alert sent</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl border border-sky-500/30 bg-sky-500/10">
                  <div className="font-bold text-sky-600 dark:text-sky-400">🏙️ City Admin</div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Municipal Review Alert sent</div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-8.5 sm:h-8 w-full sm:w-auto">
                  Upload More Files
                </Button>
                <Button size="sm" onClick={onClose} className="text-xs font-bold bg-primary text-primary-foreground h-8.5 sm:h-8 w-full sm:w-auto">
                  Done & View Listings
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* ── DRAG & DROP FILE ZONE ── */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 bg-muted/20 hover:bg-muted/40"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2.5 sm:mb-3 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-foreground break-words px-2">
                    {rawFile ? rawFile.name : "Click to select CSV or JSON file, or drag and drop"}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Supports up to 5,000 businesses per batch. Compatible with Excel CSV & Google Sheets export.
                  </p>
                </div>
              </div>

              {/* ── MULTI-TIER CONFIRMATION BANNER ── */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-indigo-500/30 bg-indigo-500/5 flex items-start gap-2.5 sm:gap-3">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 min-w-0 flex-1">
                  <div className="font-bold text-foreground text-xs sm:text-xs">
                    Automatic Multi-Tier Confirmation Protocol
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                    Once uploaded, each listing is automatically assigned to its city and country jurisdiction. Notification alerts are dispatched simultaneously to the <strong>Super Admin</strong>, <strong>Country Admin</strong>, and <strong>City Admin</strong> with 1-click confirmation tools.
                  </p>
                </div>
              </div>

              {/* ── PARSED PREVIEW TABLE ── */}
              {parsedRows.length > 0 && (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span>Parsed Preview ({parsedRows.length} rows)</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                        {validCount} Ready
                      </Badge>
                      {parsedRows.length - validCount > 0 && (
                        <Badge variant="outline" className="text-[10px] text-rose-500 border-rose-500/30">
                          {parsedRows.length - validCount} Invalid
                        </Badge>
                      )}
                    </h4>

                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-muted-foreground px-2">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
                    </Button>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl border border-border/80 overflow-hidden bg-card">
                    <div className="max-h-56 overflow-auto text-xs">
                      <table className="w-full min-w-[500px] text-left border-collapse">
                        <thead className="bg-muted/60 sticky top-0 border-b border-border/60 text-[11px] font-bold text-muted-foreground">
                          <tr>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Business Name</th>
                            <th className="p-2.5">Category</th>
                            <th className="p-2.5">City / Location</th>
                            <th className="p-2.5">Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {parsedRows.slice(0, 50).map((row, idx) => (
                            <tr key={idx} className={row.isValid ? "hover:bg-muted/30" : "bg-rose-500/5 hover:bg-rose-500/10"}>
                              <td className="p-2.5">
                                {row.isValid ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0 whitespace-nowrap">
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-[10px] py-0 whitespace-nowrap" title={row.errors.join(", ")}>
                                    Error
                                  </Badge>
                                )}
                              </td>
                              <td className="p-2.5 font-bold text-foreground">{row.name || "Untitled"}</td>
                              <td className="p-2.5 text-muted-foreground">{row.categoryName}</td>
                              <td className="p-2.5 text-muted-foreground">
                                {row.cityName}, {row.countryName}
                              </td>
                              <td className="p-2.5 text-muted-foreground font-mono text-[11px]">
                                {row.phone || row.email || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {parsedRows.length > 50 && (
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center">
                      Showing first 50 rows of {parsedRows.length}. All valid rows will be uploaded.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pinned Footer (Only shown when not on success screen) */}
        {!uploadResult && (
          <div className="p-3.5 sm:p-4 border-t border-border/60 bg-card shrink-0 flex flex-col-reverse xs:flex-row xs:items-center xs:justify-between gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs h-8.5 sm:h-8 w-full xs:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isUploading || validCount === 0}
              onClick={handleUploadSubmit}
              className="font-bold text-xs gap-1.5 shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-8.5 sm:h-8 w-full xs:w-auto justify-center"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Uploading ({uploadProgress}%)</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    Import {validCount} Listing{validCount !== 1 ? "s" : ""} & Notify Admins
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
