"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme, Theme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "pill" | "compact";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "button",
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-border/50 bg-muted/20 animate-pulse ${className}`}
      />
    );
  }

  // 1. Compact / Button Mode: Instant One-Click Toggle
  if (variant === "button" || variant === "compact") {
    const isDark = resolvedTheme === "dark";
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`relative w-9 h-9 p-0 rounded-xl hover:bg-accent border border-border/40 hover:border-border transition-all flex items-center justify-center group ${className}`}
        title={`Current: ${resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"} (Click to switch)`}
        aria-label="Toggle theme"
      >
        <Sun
          className={`w-4 h-4 text-amber-500 transition-all duration-300 ${
            isDark
              ? "scale-0 -rotate-90 opacity-0 absolute"
              : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <Moon
          className={`w-4 h-4 text-indigo-400 transition-all duration-300 ${
            isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0 absolute"
          }`}
        />
        {showLabel && (
          <span className="ml-2 text-xs font-semibold">
            {isDark ? "Dark" : "Light"}
          </span>
        )}
      </Button>
    );
  }

  // 2. Pill Switch Mode (Light / Dark / System Segmented Bar)
  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-2xl bg-muted/60 border border-border/80 text-xs font-medium ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            theme === "light"
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            theme === "dark"
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            theme === "system"
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-slate-400" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  // 3. Dropdown Menu Mode
  const themes: { key: Theme; label: string; icon: React.ReactNode }[] = [
    {
      key: "light",
      label: "Light Theme",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
    {
      key: "dark",
      label: "Dark Theme",
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
    {
      key: "system",
      label: "System Theme",
      icon: <Laptop className="w-4 h-4 text-slate-400" />,
    },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-xs font-semibold rounded-xl"
        aria-label="Select theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-indigo-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
        {showLabel && (
          <span className="capitalize">
            {theme === "system" ? "Auto" : theme}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-card border border-border shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            {themes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTheme(t.key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                  theme === t.key
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.icon}
                  <span>{t.label}</span>
                </div>
                {theme === t.key && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
