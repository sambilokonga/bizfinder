"use client";

import React from "react";
import {
  Utensils,
  UtensilsCrossed,
  Coffee,
  CupSoda,
  Pizza,
  Sandwich,
  Wine,
  Beer,
  Soup,
  Flame,
  ChefHat,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Shirt,
  Package,
  Gift,
  Watch,
  Gem,
  HeartPulse,
  Stethoscope,
  Pill,
  Hospital,
  Activity,
  Syringe,
  Smile,
  Glasses,
  Hotel,
  BedDouble,
  Compass,
  Plane,
  MapPin,
  Luggage,
  Palmtree,
  Globe,
  Car,
  Wrench,
  Truck,
  Bus,
  Bike,
  Fuel,
  Gauge,
  Navigation,
  Laptop,
  Smartphone,
  Cpu,
  Code,
  Radio,
  Tv,
  Headphones,
  Camera,
  Film,
  Landmark,
  CreditCard,
  Coins,
  DollarSign,
  Briefcase,
  Scale,
  Calculator,
  FileText,
  Sparkles,
  Scissors,
  Flower2,
  Bath,
  Dumbbell,
  Trophy,
  Medal,
  GraduationCap,
  BookOpen,
  School,
  Baby,
  Building2,
  Building,
  Home,
  Key,
  Hammer,
  HardHat,
  Paintbrush,
  PawPrint,
  Dog,
  Ticket,
  PartyPopper,
  Music,
  Gamepad2,
  Layers,
  Cake,
  Cookie,
  ShieldCheck,
  Accessibility,
  Anchor,
  Apple,
  BatteryCharging,
  Beef,
  Blocks,
  BookMarked,
  Boxes,
  Church,
  Cog,
  Croissant,
  Disc,
  DoorOpen,
  Droplets,
  Eye,
  Factory,
  Fish,
  FlaskConical,
  Footprints,
  Grid,
  HeartHandshake,
  Hourglass,
  Languages,
  Lightbulb,
  Megaphone,
  Microscope,
  Milk,
  Mountain,
  Palette,
  Paperclip,
  Pickaxe,
  Printer,
  Receipt,
  Recycle,
  Refrigerator,
  Ship,
  Sofa,
  Sprout,
  Square,
  Sun,
  Tent,
  Tractor,
  TreePine,
  User,
  UserCheck,
  Users,
  Volume2,
  Wheat,
  Zap,
  LucideIcon,
} from "lucide-react";

export interface CategoryTheme {
  iconBg: string;
  iconColor: string;
  gradient: string;
  borderHover: string;
  badgeBg: string;
  glow: string;
  lightBg: string;
}

// Industry/Category themes with vibrant tailored palettes
export const THEMES: Record<string, CategoryTheme> = {
  food: {
    iconBg: "bg-amber-100 dark:bg-amber-950/60",
    iconColor: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500/20 via-orange-500/15 to-transparent",
    borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    glow: "shadow-amber-500/10 group-hover:shadow-amber-500/25",
    lightBg: "bg-amber-50/70 dark:bg-amber-950/20",
  },
  cafe: {
    iconBg: "bg-orange-100 dark:bg-orange-950/60",
    iconColor: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500/20 via-amber-500/15 to-transparent",
    borderHover: "hover:border-orange-500/50 hover:shadow-orange-500/10",
    badgeBg: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    glow: "shadow-orange-500/10 group-hover:shadow-orange-500/25",
    lightBg: "bg-orange-50/70 dark:bg-orange-950/20",
  },
  retail: {
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-950/60",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    gradient: "from-fuchsia-500/20 via-pink-500/15 to-transparent",
    borderHover: "hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/10",
    badgeBg: "bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
    glow: "shadow-fuchsia-500/10 group-hover:shadow-fuchsia-500/25",
    lightBg: "bg-fuchsia-50/70 dark:bg-fuchsia-950/20",
  },
  health: {
    iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500/20 via-teal-500/15 to-transparent",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    glow: "shadow-emerald-500/10 group-hover:shadow-emerald-500/25",
    lightBg: "bg-emerald-50/70 dark:bg-emerald-950/20",
  },
  pharmacy: {
    iconBg: "bg-teal-100 dark:bg-teal-950/60",
    iconColor: "text-teal-600 dark:text-teal-400",
    gradient: "from-teal-500/20 via-cyan-500/15 to-transparent",
    borderHover: "hover:border-teal-500/50 hover:shadow-teal-500/10",
    badgeBg: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    glow: "shadow-teal-500/10 group-hover:shadow-teal-500/25",
    lightBg: "bg-teal-50/70 dark:bg-teal-950/20",
  },
  hotel: {
    iconBg: "bg-indigo-100 dark:bg-indigo-950/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500/20 via-purple-500/15 to-transparent",
    borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    glow: "shadow-indigo-500/10 group-hover:shadow-indigo-500/25",
    lightBg: "bg-indigo-50/70 dark:bg-indigo-950/20",
  },
  automotive: {
    iconBg: "bg-blue-100 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500/20 via-sky-500/15 to-transparent",
    borderHover: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    badgeBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    glow: "shadow-blue-500/10 group-hover:shadow-blue-500/25",
    lightBg: "bg-blue-50/70 dark:bg-blue-950/20",
  },
  beauty: {
    iconBg: "bg-rose-100 dark:bg-rose-950/60",
    iconColor: "text-rose-600 dark:text-rose-400",
    gradient: "from-rose-500/20 via-pink-500/15 to-transparent",
    borderHover: "hover:border-rose-500/50 hover:shadow-rose-500/10",
    badgeBg: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    glow: "shadow-rose-500/10 group-hover:shadow-rose-500/25",
    lightBg: "bg-rose-50/70 dark:bg-rose-950/20",
  },
  tech: {
    iconBg: "bg-cyan-100 dark:bg-cyan-950/60",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500/20 via-blue-500/15 to-transparent",
    borderHover: "hover:border-cyan-500/50 hover:shadow-cyan-500/10",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    glow: "shadow-cyan-500/10 group-hover:shadow-cyan-500/25",
    lightBg: "bg-cyan-50/70 dark:bg-cyan-950/20",
  },
  finance: {
    iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-600/20 via-teal-500/15 to-transparent",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
    glow: "shadow-emerald-500/10 group-hover:shadow-emerald-500/25",
    lightBg: "bg-emerald-50/70 dark:bg-emerald-950/20",
  },
  education: {
    iconBg: "bg-yellow-100 dark:bg-yellow-950/60",
    iconColor: "text-amber-700 dark:text-amber-300",
    gradient: "from-yellow-500/20 via-amber-500/15 to-transparent",
    borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    badgeBg: "bg-yellow-50 dark:bg-yellow-950/50 text-amber-800 dark:text-amber-200 border-yellow-200 dark:border-yellow-800",
    glow: "shadow-amber-500/10 group-hover:shadow-amber-500/25",
    lightBg: "bg-yellow-50/70 dark:bg-yellow-950/20",
  },
  fitness: {
    iconBg: "bg-red-100 dark:bg-red-950/60",
    iconColor: "text-red-600 dark:text-red-400",
    gradient: "from-red-500/20 via-orange-500/15 to-transparent",
    borderHover: "hover:border-red-500/50 hover:shadow-red-500/10",
    badgeBg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    glow: "shadow-red-500/10 group-hover:shadow-red-500/25",
    lightBg: "bg-red-50/70 dark:bg-red-950/20",
  },
  realestate: {
    iconBg: "bg-sky-100 dark:bg-sky-950/60",
    iconColor: "text-sky-600 dark:text-sky-400",
    gradient: "from-sky-500/20 via-indigo-500/15 to-transparent",
    borderHover: "hover:border-sky-500/50 hover:shadow-sky-500/10",
    badgeBg: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    glow: "shadow-sky-500/10 group-hover:shadow-sky-500/25",
    lightBg: "bg-sky-50/70 dark:bg-sky-950/20",
  },
  entertainment: {
    iconBg: "bg-violet-100 dark:bg-violet-950/60",
    iconColor: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-500/20 via-purple-500/15 to-transparent",
    borderHover: "hover:border-violet-500/50 hover:shadow-violet-500/10",
    badgeBg: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    glow: "shadow-violet-500/10 group-hover:shadow-violet-500/25",
    lightBg: "bg-violet-50/70 dark:bg-violet-950/20",
  },
  professional: {
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-700 dark:text-slate-300",
    gradient: "from-slate-500/20 via-indigo-500/15 to-transparent",
    borderHover: "hover:border-slate-500/50 hover:shadow-slate-500/10",
    badgeBg: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    glow: "shadow-slate-500/10 group-hover:shadow-slate-500/25",
    lightBg: "bg-slate-50/70 dark:bg-slate-900/20",
  },
  construction: {
    iconBg: "bg-amber-100 dark:bg-amber-950/60",
    iconColor: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-600/20 via-yellow-500/15 to-transparent",
    borderHover: "hover:border-amber-600/50 hover:shadow-amber-600/10",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
    glow: "shadow-amber-600/10 group-hover:shadow-amber-600/25",
    lightBg: "bg-amber-50/70 dark:bg-amber-950/20",
  },
  travel: {
    iconBg: "bg-teal-100 dark:bg-teal-950/60",
    iconColor: "text-teal-600 dark:text-teal-400",
    gradient: "from-teal-500/20 via-emerald-500/15 to-transparent",
    borderHover: "hover:border-teal-500/50 hover:shadow-teal-500/10",
    badgeBg: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    glow: "shadow-teal-500/10 group-hover:shadow-teal-500/25",
    lightBg: "bg-teal-50/70 dark:bg-teal-950/20",
  },
  default: {
    iconBg: "bg-indigo-100 dark:bg-indigo-950/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500/20 via-purple-500/15 to-transparent",
    borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    glow: "shadow-indigo-500/10 group-hover:shadow-indigo-500/25",
    lightBg: "bg-indigo-50/70 dark:bg-indigo-950/20",
  },
};

// Lucide icon components catalog
const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Utensils,
  UtensilsCrossed,
  Coffee,
  CupSoda,
  Pizza,
  Sandwich,
  Wine,
  Beer,
  Soup,
  Flame,
  ChefHat,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Shirt,
  Package,
  Gift,
  Watch,
  Gem,
  HeartPulse,
  Stethoscope,
  Pill,
  Hospital,
  Activity,
  Syringe,
  Smile,
  Glasses,
  Hotel,
  BedDouble,
  Compass,
  Plane,
  MapPin,
  Luggage,
  Palmtree,
  Globe,
  Car,
  Wrench,
  Truck,
  Bus,
  Bike,
  Fuel,
  Gauge,
  Navigation,
  Laptop,
  Smartphone,
  Cpu,
  Code,
  Radio,
  Tv,
  Headphones,
  Camera,
  Film,
  Landmark,
  CreditCard,
  Coins,
  DollarSign,
  Briefcase,
  Scale,
  Calculator,
  FileText,
  Sparkles,
  Scissors,
  Flower2,
  Bath,
  Dumbbell,
  Trophy,
  Medal,
  GraduationCap,
  BookOpen,
  School,
  Baby,
  Building2,
  Building,
  Home,
  Key,
  Hammer,
  HardHat,
  Paintbrush,
  PawPrint,
  Dog,
  Ticket,
  PartyPopper,
  Music,
  Gamepad2,
  Layers,
  Cake,
  Cookie,
  ShieldCheck,
  Accessibility,
  Anchor,
  Apple,
  BatteryCharging,
  Beef,
  Blocks,
  BookMarked,
  Boxes,
  Church,
  Cog,
  Croissant,
  Disc,
  DoorOpen,
  Droplets,
  Eye,
  Factory,
  Fish,
  FlaskConical,
  Footprints,
  Grid,
  HeartHandshake,
  Hourglass,
  Languages,
  Lightbulb,
  Megaphone,
  Microscope,
  Milk,
  Mountain,
  Palette,
  Paperclip,
  Pickaxe,
  Printer,
  Receipt,
  Recycle,
  Refrigerator,
  Ship,
  Sofa,
  Sprout,
  Square,
  Sun,
  Tent,
  Tractor,
  TreePine,
  User,
  UserCheck,
  Users,
  Volume2,
  Wheat,
  Zap,
  Needle: Scissors,
  Tool: Wrench,
};

/**
 * Returns the best LucideIcon component based on icon name or category text.
 */
export function getCategoryLucideIcon(iconName?: string, categoryName?: string): LucideIcon {
  if (iconName && ICON_COMPONENTS[iconName]) {
    return ICON_COMPONENTS[iconName];
  }

  const text = `${iconName || ""} ${categoryName || ""}`.toLowerCase();

  // Food & Dining
  if (text.includes("restaurant") || text.includes("dine") || text.includes("food")) return UtensilsCrossed;
  if (text.includes("coffee") || text.includes("cafe") || text.includes("café")) return Coffee;
  if (text.includes("pizza")) return Pizza;
  if (text.includes("burger") || text.includes("sandwich") || text.includes("fast food")) return Sandwich;
  if (text.includes("bakery") || text.includes("cake") || text.includes("pastry")) return Cake;
  if (text.includes("bar") || text.includes("pub") || text.includes("cocktail") || text.includes("lounge")) return Wine;
  if (text.includes("buffet") || text.includes("chef")) return ChefHat;

  // Retail & Shopping
  if (text.includes("shop") || text.includes("store") || text.includes("retail") || text.includes("market") || text.includes("mall")) return ShoppingBag;
  if (text.includes("grocery") || text.includes("supermarket")) return ShoppingCart;
  if (text.includes("cloth") || text.includes("fashion") || text.includes("apparel") || text.includes("boutique")) return Shirt;
  if (text.includes("jewelry") || text.includes("jewel") || text.includes("gold")) return Gem;

  // Health & Medicine
  if (text.includes("pharmacy") || text.includes("drug") || text.includes("medication")) return Pill;
  if (text.includes("hospital") || text.includes("clinic") || text.includes("medical") || text.includes("doctor")) return HeartPulse;
  if (text.includes("dental") || text.includes("dentist")) return Smile;
  if (text.includes("eye") || text.includes("optical") || text.includes("optom")) return Glasses;
  if (text.includes("vet") || text.includes("animal") || text.includes("pet")) return PawPrint;

  // Lodging
  if (text.includes("hotel") || text.includes("resort") || text.includes("lodg") || text.includes("stay") || text.includes("motel")) return Hotel;
  if (text.includes("bed") || text.includes("guest")) return BedDouble;

  // Automotive
  if (text.includes("auto") || text.includes("car") || text.includes("vehicle") || text.includes("mechanic")) return Car;
  if (text.includes("gas") || text.includes("fuel") || text.includes("petrol")) return Fuel;

  // Tech & Electronics
  if (text.includes("electronic") || text.includes("computer") || text.includes("tech") || text.includes("software") || text.includes("it")) return Laptop;
  if (text.includes("phone") || text.includes("mobile") || text.includes("telecom")) return Smartphone;

  // Finance & Legal
  if (text.includes("bank") || text.includes("finance") || text.includes("atm")) return Landmark;
  if (text.includes("law") || text.includes("legal") || text.includes("attorney") || text.includes("court")) return Scale;
  if (text.includes("account") || text.includes("tax") || text.includes("audit")) return Calculator;
  if (text.includes("insurance")) return ShieldCheck;

  // Beauty & Spa
  if (text.includes("beauty") || text.includes("salon") || text.includes("hair") || text.includes("barber")) return Scissors;
  if (text.includes("spa") || text.includes("massage") || text.includes("wellness")) return Sparkles;

  // Fitness
  if (text.includes("fitness") || text.includes("gym") || text.includes("workout") || text.includes("sport")) return Dumbbell;

  // Education
  if (text.includes("school") || text.includes("education") || text.includes("university") || text.includes("college") || text.includes("academy")) return GraduationCap;
  if (text.includes("book") || text.includes("library") || text.includes("stationery")) return BookOpen;

  // Real Estate & Construction
  if (text.includes("real estate") || text.includes("property") || text.includes("apartment") || text.includes("rental")) return Building2;
  if (text.includes("construct") || text.includes("contractor") || text.includes("builder")) return HardHat;
  if (text.includes("home service") || text.includes("plumb") || text.includes("repair") || text.includes("electric")) return Wrench;

  // Travel & Transport
  if (text.includes("travel") || text.includes("tour") || text.includes("safari")) return Compass;
  if (text.includes("flight") || text.includes("airline") || text.includes("airport")) return Plane;
  if (text.includes("transport") || text.includes("bus") || text.includes("shuttle")) return Bus;
  if (text.includes("logistics") || text.includes("freight") || text.includes("delivery") || text.includes("cargo")) return Truck;

  // Entertainment
  if (text.includes("entertain") || text.includes("cinema") || text.includes("movie") || text.includes("theater")) return Film;
  if (text.includes("event") || text.includes("party") || text.includes("club") || text.includes("nightlife")) return Ticket;

  return Layers;
}

/**
 * Returns the matching CategoryTheme for coloring and gradients.
 */
export function getCategoryTheme(categoryName?: string, categorySlug?: string): CategoryTheme {
  const text = `${categoryName || ""} ${categorySlug || ""}`.toLowerCase();

  if (text.includes("coffee") || text.includes("cafe") || text.includes("café") || text.includes("bakery")) return THEMES.cafe;
  if (text.includes("restaurant") || text.includes("food") || text.includes("dine") || text.includes("cuisine")) return THEMES.food;
  if (text.includes("shop") || text.includes("retail") || text.includes("store") || text.includes("market") || text.includes("grocery")) return THEMES.retail;
  if (text.includes("pharmacy") || text.includes("drug")) return THEMES.pharmacy;
  if (text.includes("health") || text.includes("medic") || text.includes("doctor") || text.includes("hospital") || text.includes("clinic") || text.includes("dental") || text.includes("optical")) return THEMES.health;
  if (text.includes("hotel") || text.includes("lodg") || text.includes("resort") || text.includes("stay") || text.includes("guest")) return THEMES.hotel;
  if (text.includes("auto") || text.includes("car") || text.includes("vehicle") || text.includes("transport")) return THEMES.automotive;
  if (text.includes("beauty") || text.includes("salon") || text.includes("spa") || text.includes("hair") || text.includes("cosmetic")) return THEMES.beauty;
  if (text.includes("tech") || text.includes("software") || text.includes("electronic") || text.includes("it ") || text.includes("it-")) return THEMES.tech;
  if (text.includes("bank") || text.includes("financ") || text.includes("insurance") || text.includes("tax")) return THEMES.finance;
  if (text.includes("school") || text.includes("educat") || text.includes("train") || text.includes("college")) return THEMES.education;
  if (text.includes("fit") || text.includes("gym") || text.includes("sport")) return THEMES.fitness;
  if (text.includes("real estate") || text.includes("property") || text.includes("rent")) return THEMES.realestate;
  if (text.includes("entertain") || text.includes("art") || text.includes("film") || text.includes("nightlife")) return THEMES.entertainment;
  if (text.includes("construct") || text.includes("contract") || text.includes("build") || text.includes("repair")) return THEMES.construction;
  if (text.includes("travel") || text.includes("tour")) return THEMES.travel;
  if (text.includes("legal") || text.includes("consult") || text.includes("law") || text.includes("professional")) return THEMES.professional;
  if (text.includes("access") || text.includes("disabilit") || text.includes("assist") || text.includes("mobility")) return THEMES.health;

  return THEMES.default;
}

/**
 * Renders an attractive, glowing Category Icon Badge
 */
export function CategoryIconBadge({
  iconName,
  categoryName,
  categorySlug,
  size = "md",
  className = "",
}: {
  iconName?: string;
  categoryName?: string;
  categorySlug?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const isEmoji = iconName && /\p{Extended_Pictographic}/u.test(iconName);
  const IconComponent = getCategoryLucideIcon(iconName, categoryName);
  const theme = getCategoryTheme(categoryName, categorySlug);

  const sizeClasses = {
    xs: {
      wrapper: "w-6 h-6 xs:w-7 xs:h-7 rounded-lg",
      icon: "w-3 h-3 xs:w-3.5 xs:h-3.5 text-xs",
    },
    sm: {
      wrapper: "w-7.5 h-7.5 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-lg xs:rounded-xl",
      icon: "w-3.5 h-3.5 xs:w-4 xs:h-4 text-xs xs:text-sm",
    },
    md: {
      wrapper: "w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl xs:rounded-2xl",
      icon: "w-4.5 h-4.5 xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-sm xs:text-base",
    },
    lg: {
      wrapper: "w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl",
      icon: "w-5.5 h-5.5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-base xs:text-lg",
    },
    xl: {
      wrapper: "w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl",
      icon: "w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-xl xs:text-2xl",
    },
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ${sizeClasses.wrapper} ${theme.iconBg} ${theme.iconColor} ${theme.glow} ${className}`}
    >
      <div className={`absolute inset-0 rounded-[inherit] bg-gradient-to-br ${theme.gradient} opacity-70 pointer-events-none`} />
      {isEmoji ? (
        <span className={`relative z-10 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center leading-none ${sizeClasses.icon}`}>
          {iconName}
        </span>
      ) : (
        <IconComponent className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${sizeClasses.icon}`} />
      )}
    </div>
  );
}
