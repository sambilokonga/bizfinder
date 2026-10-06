import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { RoleProvider } from "@/components/layout/RoleSwitcher";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppLayoutShell } from "@/components/layout/AppLayoutShell";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BizFinder — Local Business Search Engine & Directory",
  description:
    "Discover verified local restaurants, pharmacies, hotels, auto repair, and top service providers with live hours, photos, reviews, and interactive map navigation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorPrimaryForeground: "#ffffff",
          colorBackground: "#0f172a",
          colorInputBackground: "rgba(255,255,255,0.06)",
          colorInputText: "#f1f5f9",
          colorTextOnPrimaryBackground: "#ffffff",
          colorText: "#e2e8f0",
          colorTextSecondary: "#94a3b8",
          colorNeutral: "#1e293b",
          colorDanger: "#f87171",
          colorSuccess: "#34d399",
          borderRadius: "0.875rem",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          fontWeight: { normal: 400, medium: 500, bold: 700 },
          spacingUnit: "1rem",
        },
        elements: {
          /* ── UserButton Popover Dropdown ── */
          userButtonPopoverCard: "!bg-slate-900 !border !border-slate-700/80 !shadow-2xl !rounded-2xl !opacity-100 !p-3 !w-72",
          userButtonPopoverActionButton: "hover:!bg-slate-800 !text-slate-200 hover:!text-white transition-colors !rounded-xl !p-2.5",
          userButtonPopoverActionButtonText: "!font-semibold !text-xs !text-slate-200",
          userButtonPopoverFooter: "!border-t !border-slate-800/80 !pt-2",
          /* ── Card / Root ── */
          rootBox: "w-full max-w-full flex justify-center",
          cardBox: "w-full max-w-full !rounded-3xl !border-0 !shadow-none p-0 flex flex-col items-stretch",
          card: [
            "w-full max-w-full rounded-3xl !shadow-none !border-0 p-0 flex flex-col items-stretch",
          ].join(" "),
          header: "hidden",
          main: "w-full max-w-full flex flex-col items-stretch",
          form: "w-full max-w-full flex flex-col gap-3",
          /* ── Social / OAuth Buttons ── */
          socialButtonsBlockButton: [
            "w-full !bg-white/8 !border !border-white/15 !text-slate-200 !rounded-2xl",
            "hover:!bg-white/15 hover:!border-white/30 !transition-all !duration-200",
            "!font-semibold !text-sm !h-11 flex items-center justify-center",
          ].join(" "),
          socialButtonsBlockButtonText: "!text-slate-200 !font-semibold",
          /* ── Divider ── */
          dividerLine: "!bg-white/10",
          dividerText: "!text-slate-500 !text-xs !font-medium",
          /* ── Form Fields ── */
          formFieldRow: "w-full max-w-full",
          formField: "w-full max-w-full flex flex-col gap-1",
          formFieldLabel: "!text-slate-300 !text-xs !font-semibold !mb-1 !text-left",
          formFieldInput: [
            "w-full max-w-full box-border !bg-white/8 !border !border-white/15 !text-slate-100",
            "!rounded-xl !h-11 !text-sm placeholder:!text-slate-500",
            "focus:!border-indigo-500/70 focus:!ring-2 focus:!ring-indigo-500/20",
            "!transition-all !duration-200",
          ].join(" "),
          formFieldInputShowPasswordButton: "!text-slate-400 hover:!text-slate-200",
          /* ── Primary Submit Button ── */
          formButtonRow: "w-full max-w-full flex items-center justify-center",
          formButtonPrimary: [
            "w-full max-w-full box-border flex items-center justify-center",
            "!bg-gradient-to-r !from-indigo-600 !to-purple-600",
            "hover:!from-indigo-500 hover:!to-purple-500",
            "!rounded-2xl !font-bold !text-sm !h-11 !text-white",
            "!shadow-lg !shadow-indigo-500/30 !transition-all !duration-200",
            "hover:!shadow-indigo-500/50 hover:!scale-[1.02] active:!scale-[0.98]",
          ].join(" "),
          /* ── Error / Alert Messages ── */
          formFieldErrorText: "!text-red-400 !text-xs !font-medium",
          alert: "!bg-red-500/10 !border !border-red-500/20 !rounded-xl",
          alertText: "!text-red-300 !text-xs",
          /* ── Footer / Links ── */
          footer: "!bg-transparent",
          footerAction: "!bg-transparent",
          footerActionText: "!text-slate-500 !text-xs",
          footerActionLink: [
            "!text-indigo-400 hover:!text-indigo-300",
            "!font-bold !transition-colors !duration-150",
          ].join(" "),
          /* ── Identity Preview (user avatar in MFA steps) ── */
          identityPreviewText: "!text-slate-300",
          identityPreviewEditButton: "!text-indigo-400 hover:!text-indigo-300",
          /* ── OTP / Code Input ── */
          otpCodeFieldInput: [
            "!bg-white/8 !border !border-white/15 !text-white",
            "!rounded-xl focus:!border-indigo-500",
          ].join(" "),
        },
      }}
    >
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var saved = localStorage.getItem('bizfinder_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark) || (saved === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}>
          <ThemeProvider>
            <RoleProvider>
              <AppLayoutShell>{children}</AppLayoutShell>
            </RoleProvider>
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

