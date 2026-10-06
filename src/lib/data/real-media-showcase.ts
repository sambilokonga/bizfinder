import { BusinessMedia, MediaType } from "@/types/business";

export interface ShowcasePhotoTemplate {
  url: string;
  type: MediaType;
  title: string;
  caption: string;
}

export const REAL_SHOWCASE_PHOTOS: ShowcasePhotoTemplate[] = [
  {
    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    type: "cover",
    title: "Panoramic Dining Hall & Front Terrace",
    caption: "Primary panoramic exterior and interior frontage showcase for main profile header",
  },
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: "Main Dining Hall & Ambient Lighting",
    caption: "Spacious main dining hall with handcrafted wooden tables and warm evening illumination",
  },
  {
    url: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: "Artisanal Espresso & Brew Bar",
    caption: "Dedicated barista counter with high-end Italian espresso machine and specialty beans",
  },
  {
    url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: "Executive Lounge & Private Booths",
    caption: "Comfortable private seating area tailored for business meetings and quiet conversations",
  },
  {
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: "Open Culinary Exhibition Kitchen",
    caption: "Transparent view of the culinary team preparing gourmet orders in clean stainless steel prep stations",
  },
  {
    url: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: "Mezzanine Balcony Seating",
    caption: "Elevated upper floor overlooking the garden atrium and city skyline",
  },
  {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    type: "menu",
    title: "Chef's Signature Gourmet Platter",
    caption: "House specialty dish prepared fresh with organic herbs and artisanal local ingredients",
  },
  {
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    type: "menu",
    title: "Traditional Single-Origin Coffee Roast",
    caption: "Freshly brewed highland Arabica coffee served in traditional ceramics",
  },
  {
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    type: "menu",
    title: "Artisanal Bakery & Fresh Pastries",
    caption: "Daily baked croissants, sourdough baguettes, and delicate desserts",
  },
  {
    url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    type: "menu",
    title: "Wood-Fired Signature Pizza & Flatbread",
    caption: "Crispy hearth-baked dough topped with fresh mozzarella and basil",
  },
  {
    url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    type: "menu",
    title: "Handcrafted Refreshments & Cocktails",
    caption: "Cold-pressed fruit infusions, mocktails, and fresh natural coolers",
  },
  {
    url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    type: "menu",
    title: "Gourmet Dessert & Pastry Tower",
    caption: "Rich chocolate ganache, layered tiramisu, and berry tarts",
  },
  {
    url: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80",
    type: "exterior",
    title: "Main Street Front Entrance & Branding",
    caption: "Illuminated outdoor facade welcoming visitors along the primary commercial boulevard",
  },
  {
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
    type: "exterior",
    title: "Garden Courtyard & Outdoor Patio",
    caption: "Lush botanical patio with shaded parasols, heated lamps, and stone pathways",
  },
  {
    url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
    type: "exterior",
    title: "Evening Terrace & Golden Hour Setting",
    caption: "Sunset view of the outdoor seating deck during peak social hours",
  },
  {
    url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80",
    type: "staff",
    title: "Executive Head Chef & Kitchen Brigade",
    caption: "Culinary director inspecting plates prior to dining room presentation",
  },
  {
    url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
    type: "staff",
    title: "Certified Lead Barista at Work",
    caption: "Crafting custom latte art with microfoam perfection for patron orders",
  },
  {
    url: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80",
    type: "staff",
    title: "Customer Hospitality & Concierge Desk",
    caption: "Friendly front desk team managing reservations, check-ins, and guest inquiries",
  },
  {
    url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80",
    type: "product",
    title: "Packaged Retail Coffee & Gift Merch",
    caption: "Packaged whole-bean coffee bags and custom branded merchandise",
  },
  {
    url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80",
    type: "product",
    title: "Specialty Tea & Ceramic Teaware Display",
    caption: "Curated loose-leaf tea collection and handmade artisanal cups",
  },
  {
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    type: "promo",
    title: "Live Acoustic Weekend Sessions",
    caption: "Live weekend music performance setup in the main hall",
  },
  {
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
    type: "promo",
    title: "Private Celebration & Banquet Setup",
    caption: "Bespoke decoration and table arrangements for VIP birthday and corporate celebrations",
  },
  {
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: "High-Speed Wi-Fi Workstation Lounge",
    caption: "Dedicated desks with electrical sockets and quiet corners for remote professionals",
  },
  {
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: "Festive Holiday & Seasonal Decor",
    caption: "Seasonal lighting installations creating an inviting ambiance for visitors",
  },
  {
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    type: "logo",
    title: "Official Brand Seal & Certified Plaque",
    caption: "Official high-resolution emblem and verified municipal compliance badge",
  },
];

/**
 * Builds a curated set of 24 realistic media items customized for a specific business name
 */
export function buildRealShowcaseMedia(businessName: string): BusinessMedia[] {
  const baseTime = Date.now();
  return REAL_SHOWCASE_PHOTOS.map((photo, index) => ({
    id: `media-showcase-${baseTime}-${index + 1}`,
    url: photo.url,
    type: photo.type,
    title: `${businessName} – ${photo.title}`,
    sortOrder: index + 1,
    uploadedAt: new Date(baseTime - (25 - index) * 3600000).toISOString(),
  }));
}
