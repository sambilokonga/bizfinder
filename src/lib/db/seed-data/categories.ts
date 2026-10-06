import { Category, CategoryTree } from "@/types/category";
import { SHOPS_RETAIL_CATEGORIES } from "./shops-retail-categories";

const SEED_CATEGORIES_BASE: Category[] = [
  // ==========================================
  // 1. Restaurants & Food Services
  // ==========================================
  { id: "cat-1", name: "Restaurants & Food Services", slug: "restaurants-food-services", icon: "Utensils", level: 1, featured: true },
  
  // 1.1 Restaurants
  { id: "cat-1-1", parentId: "cat-1", name: "Restaurants", slug: "restaurants", icon: "UtensilsCrossed", level: 2, featured: true },
  { id: "cat-1-1-1", parentId: "cat-1-1", name: "General Restaurant", slug: "general-restaurant", level: 3 },
  { id: "cat-1-1-2", parentId: "cat-1-1", name: "Fine Dining Restaurant", slug: "fine-dining-restaurant", level: 3 },
  { id: "cat-1-1-3", parentId: "cat-1-1", name: "Casual Dining Restaurant", slug: "casual-dining-restaurant", level: 3 },
  { id: "cat-1-1-4", parentId: "cat-1-1", name: "Family Restaurant", slug: "family-restaurant", level: 3 },
  { id: "cat-1-1-5", parentId: "cat-1-1", name: "Buffet Restaurant", slug: "buffet-restaurant", level: 3 },
  { id: "cat-1-1-6", parentId: "cat-1-1", name: "Fast Food Restaurant", slug: "fast-food-restaurant", level: 3 },
  { id: "cat-1-1-7", parentId: "cat-1-1", name: "Self-Service Restaurant", slug: "self-service-restaurant", level: 3 },
  { id: "cat-1-1-8", parentId: "cat-1-1", name: "Drive-In Restaurant", slug: "drive-in-restaurant", level: 3 },
  { id: "cat-1-1-9", parentId: "cat-1-1", name: "Takeaway Restaurant", slug: "takeaway-restaurant", level: 3 },
  { id: "cat-1-1-10", parentId: "cat-1-1", name: "Pop-Up Restaurant", slug: "pop-up-restaurant", level: 3 },
  { id: "cat-1-1-11", parentId: "cat-1-1", name: "Rooftop Restaurant", slug: "rooftop-restaurant", level: 3 },
  { id: "cat-1-1-12", parentId: "cat-1-1", name: "Waterfront Restaurant", slug: "waterfront-restaurant", level: 3 },
  { id: "cat-1-1-13", parentId: "cat-1-1", name: "Theme Restaurant", slug: "theme-restaurant", level: 3 },

  // 1.2 Cuisine
  { id: "cat-1-2", parentId: "cat-1", name: "Cuisines of the World", slug: "cuisines", icon: "Globe", level: 2, featured: true },
  { id: "cat-1-2-1", parentId: "cat-1-2", name: "Ethiopian Restaurant", slug: "ethiopian-restaurant", level: 3, featured: true },
  { id: "cat-1-2-2", parentId: "cat-1-2", name: "Eritrean Restaurant", slug: "eritrean-restaurant", level: 3 },
  { id: "cat-1-2-3", parentId: "cat-1-2", name: "Somali Restaurant", slug: "somali-restaurant", level: 3 },
  { id: "cat-1-2-4", parentId: "cat-1-2", name: "Kenyan Restaurant", slug: "kenyan-restaurant", level: 3 },
  { id: "cat-1-2-5", parentId: "cat-1-2", name: "Nigerian Restaurant", slug: "nigerian-restaurant", level: 3 },
  { id: "cat-1-2-6", parentId: "cat-1-2", name: "Ghanaian Restaurant", slug: "ghanaian-restaurant", level: 3 },
  { id: "cat-1-2-7", parentId: "cat-1-2", name: "South African Restaurant", slug: "south-african-restaurant", level: 3 },
  { id: "cat-1-2-8", parentId: "cat-1-2", name: "Moroccan Restaurant", slug: "moroccan-restaurant", level: 3 },
  { id: "cat-1-2-9", parentId: "cat-1-2", name: "Egyptian Restaurant", slug: "egyptian-restaurant", level: 3 },
  { id: "cat-1-2-10", parentId: "cat-1-2", name: "Indian Restaurant", slug: "indian-restaurant", level: 3 },
  { id: "cat-1-2-11", parentId: "cat-1-2", name: "Pakistani Restaurant", slug: "pakistani-restaurant", level: 3 },
  { id: "cat-1-2-12", parentId: "cat-1-2", name: "Bangladeshi Restaurant", slug: "bangladeshi-restaurant", level: 3 },
  { id: "cat-1-2-13", parentId: "cat-1-2", name: "Chinese Restaurant", slug: "chinese-restaurant", level: 3 },
  { id: "cat-1-2-14", parentId: "cat-1-2", name: "Japanese Restaurant", slug: "japanese-restaurant", level: 3 },
  { id: "cat-1-2-15", parentId: "cat-1-2", name: "Korean Restaurant", slug: "korean-restaurant", level: 3 },
  { id: "cat-1-2-16", parentId: "cat-1-2", name: "Thai Restaurant", slug: "thai-restaurant", level: 3 },
  { id: "cat-1-2-17", parentId: "cat-1-2", name: "Vietnamese Restaurant", slug: "vietnamese-restaurant", level: 3 },
  { id: "cat-1-2-18", parentId: "cat-1-2", name: "Filipino Restaurant", slug: "filipino-restaurant", level: 3 },
  { id: "cat-1-2-19", parentId: "cat-1-2", name: "Indonesian Restaurant", slug: "indonesian-restaurant", level: 3 },
  { id: "cat-1-2-20", parentId: "cat-1-2", name: "Malaysian Restaurant", slug: "malaysian-restaurant", level: 3 },
  { id: "cat-1-2-21", parentId: "cat-1-2", name: "Italian Restaurant", slug: "italian-restaurant", level: 3 },
  { id: "cat-1-2-22", parentId: "cat-1-2", name: "French Restaurant", slug: "french-restaurant", level: 3 },
  { id: "cat-1-2-23", parentId: "cat-1-2", name: "Spanish Restaurant", slug: "spanish-restaurant", level: 3 },
  { id: "cat-1-2-24", parentId: "cat-1-2", name: "Greek Restaurant", slug: "greek-restaurant", level: 3 },
  { id: "cat-1-2-25", parentId: "cat-1-2", name: "Turkish Restaurant", slug: "turkish-restaurant", level: 3 },
  { id: "cat-1-2-26", parentId: "cat-1-2", name: "Mexican Restaurant", slug: "mexican-restaurant", level: 3 },
  { id: "cat-1-2-27", parentId: "cat-1-2", name: "Brazilian Restaurant", slug: "brazilian-restaurant", level: 3 },
  { id: "cat-1-2-28", parentId: "cat-1-2", name: "American Restaurant", slug: "american-restaurant", level: 3 },
  { id: "cat-1-2-29", parentId: "cat-1-2", name: "Caribbean Restaurant", slug: "caribbean-restaurant", level: 3 },
  { id: "cat-1-2-30", parentId: "cat-1-2", name: "Mediterranean Restaurant", slug: "mediterranean-restaurant", level: 3 },
  { id: "cat-1-2-31", parentId: "cat-1-2", name: "Middle Eastern Restaurant", slug: "middle-eastern-restaurant", level: 3 },

  // 1.3 Fast Food
  { id: "cat-1-3", parentId: "cat-1", name: "Fast Food & Quick Bites", slug: "fast-food", icon: "Sandwich", level: 2 },
  { id: "cat-1-3-1", parentId: "cat-1-3", name: "Burger Restaurant", slug: "burger-restaurant", level: 3 },
  { id: "cat-1-3-2", parentId: "cat-1-3", name: "Pizza Restaurant", slug: "pizza-restaurant", level: 3 },
  { id: "cat-1-3-3", parentId: "cat-1-3", name: "Fried Chicken Restaurant", slug: "fried-chicken-restaurant", level: 3 },
  { id: "cat-1-3-4", parentId: "cat-1-3", name: "Sandwich Shop", slug: "sandwich-shop", level: 3 },
  { id: "cat-1-3-5", parentId: "cat-1-3", name: "Hot Dog Restaurant", slug: "hot-dog-restaurant", level: 3 },
  { id: "cat-1-3-6", parentId: "cat-1-3", name: "Taco Restaurant", slug: "taco-restaurant", level: 3 },
  { id: "cat-1-3-7", parentId: "cat-1-3", name: "Kebab Restaurant", slug: "kebab-restaurant", level: 3 },
  { id: "cat-1-3-8", parentId: "cat-1-3", name: "Shawarma Restaurant", slug: "shawarma-restaurant", level: 3 },
  { id: "cat-1-3-9", parentId: "cat-1-3", name: "Burrito Restaurant", slug: "burrito-restaurant", level: 3 },
  { id: "cat-1-3-10", parentId: "cat-1-3", name: "Noodle Restaurant", slug: "noodle-restaurant", level: 3 },
  { id: "cat-1-3-11", parentId: "cat-1-3", name: "Dumpling Restaurant", slug: "dumpling-restaurant", level: 3 },
  { id: "cat-1-3-12", parentId: "cat-1-3", name: "Fried Food Shop", slug: "fried-food-shop", level: 3 },

  // 1.4 Specialty Food
  { id: "cat-1-4", parentId: "cat-1", name: "Specialty Dining & Diets", slug: "specialty-dining", icon: "Flame", level: 2 },
  { id: "cat-1-4-1", parentId: "cat-1-4", name: "Seafood Restaurant", slug: "seafood-restaurant", level: 3 },
  { id: "cat-1-4-2", parentId: "cat-1-4", name: "Steakhouse", slug: "steakhouse", level: 3 },
  { id: "cat-1-4-3", parentId: "cat-1-4", name: "Sushi Restaurant", slug: "sushi-restaurant", level: 3 },
  { id: "cat-1-4-4", parentId: "cat-1-4", name: "Vegan Restaurant", slug: "vegan-restaurant", level: 3 },
  { id: "cat-1-4-5", parentId: "cat-1-4", name: "Vegetarian Restaurant", slug: "vegetarian-restaurant", level: 3 },
  { id: "cat-1-4-6", parentId: "cat-1-4", name: "Halal Restaurant", slug: "halal-restaurant", level: 3 },
  { id: "cat-1-4-7", parentId: "cat-1-4", name: "Kosher Restaurant", slug: "kosher-restaurant", level: 3 },
  { id: "cat-1-4-8", parentId: "cat-1-4", name: "Gluten-Free Restaurant", slug: "gluten-free-restaurant", level: 3 },
  { id: "cat-1-4-9", parentId: "cat-1-4", name: "Organic Food Restaurant", slug: "organic-food-restaurant", level: 3 },
  { id: "cat-1-4-10", parentId: "cat-1-4", name: "Raw Food Restaurant", slug: "raw-food-restaurant", level: 3 },
  { id: "cat-1-4-11", parentId: "cat-1-4", name: "BBQ Restaurant", slug: "bbq-restaurant", level: 3 },
  { id: "cat-1-4-12", parentId: "cat-1-4", name: "Grill Restaurant", slug: "grill-restaurant", level: 3 },
  { id: "cat-1-4-13", parentId: "cat-1-4", name: "Breakfast Restaurant", slug: "breakfast-restaurant", level: 3 },
  { id: "cat-1-4-14", parentId: "cat-1-4", name: "Brunch Restaurant", slug: "brunch-restaurant", level: 3 },
  { id: "cat-1-4-15", parentId: "cat-1-4", name: "Soup Restaurant", slug: "soup-restaurant", level: 3 },
  { id: "cat-1-4-16", parentId: "cat-1-4", name: "Salad Restaurant", slug: "salad-restaurant", level: 3 },
  { id: "cat-1-4-17", parentId: "cat-1-4", name: "Pasta Restaurant", slug: "pasta-restaurant", level: 3 },



  // ==========================================
  // 3. Bakeries & Confectionery
  // ==========================================
  { id: "cat-3", name: "Bakeries & Confectionery", slug: "bakeries-confectionery", icon: "Cake", level: 1 },
  { id: "cat-3-1", parentId: "cat-3", name: "Bakeries", slug: "bakeries", level: 2 },
  { id: "cat-3-1-1", parentId: "cat-3-1", name: "Artisan Bakery", slug: "artisan-bakery", level: 3 },
  { id: "cat-3-1-2", parentId: "cat-3-1", name: "Bread Bakery", slug: "bread-bakery", level: 3 },
  { id: "cat-3-1-3", parentId: "cat-3-1", name: "Cake Bakery", slug: "cake-bakery", level: 3 },
  { id: "cat-3-1-4", parentId: "cat-3-1", name: "Pastry Bakery", slug: "pastry-bakery", level: 3 },
  { id: "cat-3-1-5", parentId: "cat-3-1", name: "French Bakery", slug: "french-bakery", level: 3 },
  { id: "cat-3-1-6", parentId: "cat-3-1", name: "Ethiopian Bakery", slug: "ethiopian-bakery", level: 3 },
  { id: "cat-3-1-7", parentId: "cat-3-1", name: "Gluten-Free Bakery", slug: "gluten-free-bakery", level: 3 },
  { id: "cat-3-2", parentId: "cat-3", name: "Desserts & Ice Cream", slug: "desserts-ice-cream", level: 2 },
  { id: "cat-3-2-1", parentId: "cat-3-2", name: "Cake Shop", slug: "cake-shop", level: 3 },
  { id: "cat-3-2-2", parentId: "cat-3-2", name: "Cupcake Shop", slug: "cupcake-shop", level: 3 },
  { id: "cat-3-2-3", parentId: "cat-3-2", name: "Donut Shop", slug: "donut-shop", level: 3 },
  { id: "cat-3-2-4", parentId: "cat-3-2", name: "Chocolate Shop", slug: "chocolate-shop", level: 3 },
  { id: "cat-3-2-5", parentId: "cat-3-2", name: "Ice Cream Shop", slug: "ice-cream-shop", level: 3 },
  { id: "cat-3-2-6", parentId: "cat-3-2", name: "Gelato Shop", slug: "gelato-shop", level: 3 },
  { id: "cat-3-2-7", parentId: "cat-3-2", name: "Waffle Shop", slug: "waffle-shop", level: 3 },
  { id: "cat-3-2-8", parentId: "cat-3-2", name: "Pancake Shop", slug: "pancake-shop", level: 3 },
  { id: "cat-3-2-9", parentId: "cat-3-2", name: "Crepe Shop", slug: "crepe-shop", level: 3 },



  // ==========================================
  // 7. Beauty & Personal Care
  // ==========================================
  { id: "cat-7", name: "Beauty & Personal Care", slug: "beauty-personal-care", icon: "Scissors", level: 1, featured: true },
  { id: "cat-7-1", parentId: "cat-7", name: "Hair Salons & Barbers", slug: "hair-salons-barbers", level: 2 },
  { id: "cat-7-1-1", parentId: "cat-7-1", name: "Barber Shop", slug: "barber-shop", level: 3 },
  { id: "cat-7-1-2", parentId: "cat-7-1", name: "Women's Hair Salon", slug: "womens-hair-salon", level: 3 },
  { id: "cat-7-1-3", parentId: "cat-7-1", name: "Braiding & Dreadlock Salon", slug: "braiding-salon", level: 3 },
  { id: "cat-7-2", parentId: "cat-7", name: "Beauty & Skincare", slug: "beauty-skincare", level: 2 },
  { id: "cat-7-2-1", parentId: "cat-7-2", name: "Beauty Salon & Makeup Studio", slug: "beauty-makeup-studio", level: 3 },
  { id: "cat-7-2-2", parentId: "cat-7-2", name: "Skincare Clinic", slug: "skincare-clinic", level: 3 },
  { id: "cat-7-2-3", parentId: "cat-7-2", name: "Cosmetics Store", slug: "cosmetics-store", level: 3 },
  { id: "cat-7-3", parentId: "cat-7", name: "Nail Salons & Spas", slug: "nails-spas", level: 2 },
  { id: "cat-7-3-1", parentId: "cat-7-3", name: "Nail Salon & Manicure", slug: "nail-salon", level: 3 },
  { id: "cat-7-3-2", parentId: "cat-7-3", name: "Day Spa & Massage", slug: "day-spa-massage", level: 3 },
  { id: "cat-7-3-3", parentId: "cat-7-3", name: "Sauna, Steam & Hammam", slug: "sauna-steam-hammam", level: 3 },

  // ==========================================
  // 8. Health & Medical
  // ==========================================
  { id: "cat-8", name: "Health & Medical", slug: "health-medical", icon: "HeartPulse", level: 1, featured: true },
  { id: "cat-8-1", parentId: "cat-8", name: "Hospitals", slug: "hospitals", level: 2 },
  { id: "cat-8-1-1", parentId: "cat-8-1", name: "General Hospital", slug: "general-hospital", level: 3 },
  { id: "cat-8-1-2", parentId: "cat-8-1", name: "Private Hospital", slug: "private-hospital", level: 3 },
  { id: "cat-8-1-3", parentId: "cat-8-1", name: "Specialty Hospital", slug: "specialty-hospital", level: 3 },
  { id: "cat-8-2", parentId: "cat-8", name: "Medical Clinics", slug: "medical-clinics", level: 2 },
  { id: "cat-8-2-1", parentId: "cat-8-2", name: "Family & General Practice Clinic", slug: "family-general-clinic", level: 3 },
  { id: "cat-8-2-2", parentId: "cat-8-2", name: "Pediatric Clinic", slug: "pediatric-clinic", level: 3 },
  { id: "cat-8-2-3", parentId: "cat-8-2", name: "Dermatology Clinic", slug: "dermatology-clinic", level: 3 },
  { id: "cat-8-2-4", parentId: "cat-8-2", name: "Cardiology Clinic", slug: "cardiology-clinic", level: 3 },
  { id: "cat-8-3", parentId: "cat-8", name: "Medical Services & Labs", slug: "medical-services-labs", level: 2 },
  { id: "cat-8-3-1", parentId: "cat-8-3", name: "Medical Laboratory & Diagnostics", slug: "medical-laboratory", level: 3 },
  { id: "cat-8-3-2", parentId: "cat-8-3", name: "Imaging & Radiology Center", slug: "imaging-radiology-center", level: 3 },
  { id: "cat-8-3-3", parentId: "cat-8-3", name: "Ambulance & Emergency Service", slug: "ambulance-service", level: 3 },

  // ==========================================
  // 9. Pharmacy & Pharmaceutical
  // ==========================================
  { id: "cat-9", name: "Pharmacy & Pharmaceutical", slug: "pharmacy-pharmaceutical", icon: "Pill", level: 1, featured: true },
  { id: "cat-9-1", parentId: "cat-9", name: "Pharmacies", slug: "pharmacies", level: 2 },
  { id: "cat-9-1-1", parentId: "cat-9-1", name: "Community Pharmacy", slug: "community-pharmacy", level: 3 },
  { id: "cat-9-1-2", parentId: "cat-9-1", name: "24-Hour Pharmacy", slug: "24-hour-pharmacy", level: 3 },
  { id: "cat-9-1-3", parentId: "cat-9-1", name: "Hospital Pharmacy", slug: "hospital-pharmacy", level: 3 },
  { id: "cat-9-1-4", parentId: "cat-9-1", name: "Pharmaceutical Distributor", slug: "pharmaceutical-distributor", level: 3 },
  { id: "cat-9-1-5", parentId: "cat-9-1", name: "Medical Equipment & Surgical Store", slug: "medical-equipment-store", level: 3 },

  // ==========================================
  // 10. Dental
  // ==========================================
  { id: "cat-10", name: "Dental Care", slug: "dental-care", icon: "Smile", level: 1 },
  { id: "cat-10-1", parentId: "cat-10", name: "Dental Clinics & Specialists", slug: "dental-clinics-specialists", level: 2 },
  { id: "cat-10-1-1", parentId: "cat-10-1", name: "General Dentist", slug: "general-dentist", level: 3 },
  { id: "cat-10-1-2", parentId: "cat-10-1", name: "Orthodontist & Braces", slug: "orthodontist", level: 3 },
  { id: "cat-10-1-3", parentId: "cat-10-1", name: "Dental Implant Center", slug: "dental-implant-center", level: 3 },
  { id: "cat-10-1-4", parentId: "cat-10-1", name: "Teeth Whitening Center", slug: "teeth-whitening-center", level: 3 },

  // ==========================================
  // 11. Eye Care
  // ==========================================
  { id: "cat-11", name: "Eye Care & Optical", slug: "eye-care-optical", icon: "Glasses", level: 1 },
  { id: "cat-11-1", parentId: "cat-11", name: "Optometry & Optical Stores", slug: "optometry-stores", level: 2 },
  { id: "cat-11-1-1", parentId: "cat-11-1", name: "Optometrist & Eye Clinic", slug: "optometrist-eye-clinic", level: 3 },
  { id: "cat-11-1-2", parentId: "cat-11-1", name: "Optical Store & Eyeglasses", slug: "optical-store-eyeglasses", level: 3 },
  { id: "cat-11-1-3", parentId: "cat-11-1", name: "LASIK & Eye Hospital", slug: "lasik-eye-hospital", level: 3 },

  // ==========================================
  // 12. Veterinary & Animal Services
  // ==========================================
  { id: "cat-12", name: "Veterinary & Animal Services", slug: "veterinary-animal-services", icon: "PawPrint", level: 1 },
  { id: "cat-12-1", parentId: "cat-12", name: "Veterinary Care & Pets", slug: "vet-care-pets", level: 2 },
  { id: "cat-12-1-1", parentId: "cat-12-1", name: "Veterinary Hospital & Pet Clinic", slug: "veterinary-hospital", level: 3 },
  { id: "cat-12-1-2", parentId: "cat-12-1", name: "Pet Grooming & Boarding Hotel", slug: "pet-grooming-hotel", level: 3 },
  { id: "cat-12-1-3", parentId: "cat-12-1", name: "Pet Store & Animal Supplies", slug: "pet-store", level: 3 },

  // ==========================================
  // 13. Education
  // ==========================================
  { id: "cat-13", name: "Education & Schools", slug: "education-schools", icon: "GraduationCap", level: 1 },
  { id: "cat-13-1", parentId: "cat-13", name: "Schools & Academies", slug: "schools-academies", level: 2 },
  { id: "cat-13-1-1", parentId: "cat-13-1", name: "Preschool & Kindergarten", slug: "preschool-kindergarten", level: 3 },
  { id: "cat-13-1-2", parentId: "cat-13-1", name: "International & High School", slug: "international-high-school", level: 3 },
  { id: "cat-13-2", parentId: "cat-13", name: "Higher Education & Universities", slug: "higher-education-universities", level: 2 },
  { id: "cat-13-2-1", parentId: "cat-13-2", name: "University & College", slug: "university-college", level: 3 },
  { id: "cat-13-3", parentId: "cat-13", name: "Vocational & Skill Training", slug: "vocational-training", level: 2 },
  { id: "cat-13-3-1", parentId: "cat-13-3", name: "Driving School", slug: "driving-school", level: 3 },
  { id: "cat-13-3-2", parentId: "cat-13-3", name: "Language School & Computer Center", slug: "language-computer-school", level: 3 },

  // ==========================================
  // 14. Professional Services
  // ==========================================
  { id: "cat-14", name: "Professional & Consulting", slug: "professional-consulting", icon: "Briefcase", level: 1 },
  { id: "cat-14-1", parentId: "cat-14", name: "Consulting Firms", slug: "consulting-firms", level: 2 },
  { id: "cat-14-1-1", parentId: "cat-14-1", name: "Management & Business Consultant", slug: "management-business-consultant", level: 3 },
  { id: "cat-14-1-2", parentId: "cat-14-1", name: "IT & Digital Strategy Consultant", slug: "it-digital-consultant", level: 3 },
  { id: "cat-14-1-3", parentId: "cat-14-1", name: "Marketing & HR Consultant", slug: "marketing-hr-consultant", level: 3 },

  // ==========================================
  // 15. Legal Services
  // ==========================================
  { id: "cat-15", name: "Legal Services", slug: "legal-services", icon: "Scale", level: 1 },
  { id: "cat-15-1", parentId: "cat-15", name: "Law Firms & Attorneys", slug: "law-firms-attorneys", level: 2 },
  { id: "cat-15-1-1", parentId: "cat-15-1", name: "Corporate Law Firm", slug: "corporate-law-firm", level: 3 },
  { id: "cat-15-1-2", parentId: "cat-15-1", name: "Criminal & Family Lawyer", slug: "criminal-family-lawyer", level: 3 },
  { id: "cat-15-1-3", parentId: "cat-15-1", name: "Notary & Mediation Services", slug: "notary-mediation-services", level: 3 },

  // ==========================================
  // 16. Accounting & Finance
  // ==========================================
  { id: "cat-16", name: "Accounting & Tax Services", slug: "accounting-tax", icon: "Calculator", level: 1 },
  { id: "cat-16-1", parentId: "cat-16", name: "Audit & Bookkeeping", slug: "audit-bookkeeping", level: 2 },
  { id: "cat-16-1-1", parentId: "cat-16-1", name: "Certified Accounting Firm", slug: "certified-accounting-firm", level: 3 },
  { id: "cat-16-1-2", parentId: "cat-16-1", name: "Tax Preparation & Advisory", slug: "tax-preparation-advisory", level: 3 },
  { id: "cat-16-1-3", parentId: "cat-16-1", name: "Audit & Payroll Services", slug: "audit-payroll-services", level: 3 },

  // ==========================================
  // 17. Banking & Financial Services
  // ==========================================
  { id: "cat-17", name: "Banking & Financial Services", slug: "banking-financial-services", icon: "Landmark", level: 1, featured: true },
  { id: "cat-17-1", parentId: "cat-17", name: "Banks & ATMs", slug: "banks-atms", level: 2 },
  { id: "cat-17-1-1", parentId: "cat-17-1", name: "Commercial Bank", slug: "commercial-bank", level: 3 },
  { id: "cat-17-1-2", parentId: "cat-17-1", name: "ATM & Automated Teller", slug: "atm-automated-teller", level: 3 },
  { id: "cat-17-1-3", parentId: "cat-17-1", name: "Money Transfer & Forex Bureau", slug: "money-transfer-forex", level: 3 },
  { id: "cat-17-1-4", parentId: "cat-17-1", name: "Microfinance & Fintech", slug: "microfinance-fintech", level: 3 },

  // ==========================================
  // 18. Insurance
  // ==========================================
  { id: "cat-18", name: "Insurance", slug: "insurance", icon: "ShieldCheck", level: 1 },
  { id: "cat-18-1", parentId: "cat-18", name: "Insurance Agencies & Brokers", slug: "insurance-agencies", level: 2 },
  { id: "cat-18-1-1", parentId: "cat-18-1", name: "Life & Health Insurance", slug: "life-health-insurance", level: 3 },
  { id: "cat-18-1-2", parentId: "cat-18-1", name: "Vehicle & Property Insurance", slug: "vehicle-property-insurance", level: 3 },
  { id: "cat-18-1-3", parentId: "cat-18-1", name: "Business & Marine Insurance", slug: "business-marine-insurance", level: 3 },

  // ==========================================
  // 19. Real Estate
  // ==========================================
  { id: "cat-19", name: "Real Estate & Property", slug: "real-estate-property", icon: "Building", level: 1, featured: true },
  { id: "cat-19-1", parentId: "cat-19", name: "Real Estate Agencies", slug: "real-estate-agencies", level: 2 },
  { id: "cat-19-1-1", parentId: "cat-19-1", name: "Residential Property & Rentals", slug: "residential-rentals", level: 3 },
  { id: "cat-19-1-2", parentId: "cat-19-1", name: "Commercial & Office Space", slug: "commercial-office-space", level: 3 },
  { id: "cat-19-1-3", parentId: "cat-19-1", name: "Property Developer & Land Sales", slug: "property-developer-land", level: 3 },

  // ==========================================
  // 20. Construction
  // ==========================================
  { id: "cat-20", name: "Construction & Contractors", slug: "construction-contractors", icon: "HardHat", level: 1 },
  { id: "cat-20-1", parentId: "cat-20", name: "General & Civil Contractors", slug: "general-civil-contractors", level: 2 },
  { id: "cat-20-1-1", parentId: "cat-20-1", name: "Building & General Contractor", slug: "building-general-contractor", level: 3 },
  { id: "cat-20-1-2", parentId: "cat-20-1", name: "Civil Engineering & Road Works", slug: "civil-engineering-road", level: 3 },
  { id: "cat-20-1-3", parentId: "cat-20-1", name: "Electrical & Plumbing Contractor", slug: "electrical-plumbing-contractor", level: 3 },

  // ==========================================
  // 22. Home Services
  // ==========================================
  { id: "cat-22", name: "Home Services & Maintenance", slug: "home-services-maintenance", icon: "Wrench", level: 1 },
  { id: "cat-22-1", parentId: "cat-22", name: "Plumbing, Electrical & HVAC", slug: "plumbing-electrical-hvac", level: 2 },
  { id: "cat-22-1-1", parentId: "cat-22-1", name: "Plumbing Service", slug: "plumbing-service", level: 3 },
  { id: "cat-22-1-2", parentId: "cat-22-1", name: "Electrical & Appliance Repair", slug: "electrical-appliance-repair", level: 3 },
  { id: "cat-22-1-3", parentId: "cat-22-1", name: "Air Conditioning & Heating (HVAC)", slug: "hvac-air-conditioning", level: 3 },
  { id: "cat-22-1-4", parentId: "cat-22-1", name: "Locksmith & Security Installation", slug: "locksmith-security-install", level: 3 },



  // ==========================================
  // 25. Software & IT
  // ==========================================
  { id: "cat-25", name: "Software & IT Services", slug: "software-it-services", icon: "Code", level: 1 },
  { id: "cat-25-1", parentId: "cat-25", name: "Software Development & Cloud", slug: "software-dev-cloud", level: 2 },
  { id: "cat-25-1-1", parentId: "cat-25-1", name: "Web & Mobile App Development", slug: "web-mobile-development", level: 3 },
  { id: "cat-25-1-2", parentId: "cat-25-1", name: "Cybersecurity & Cloud Solutions", slug: "cybersecurity-cloud", level: 3 },
  { id: "cat-25-1-3", parentId: "cat-25-1", name: "AI & Machine Learning Solutions", slug: "ai-machine-learning", level: 3 },

  // ==========================================
  // 26. Telecommunications
  // ==========================================
  { id: "cat-26", name: "Telecommunications", slug: "telecommunications", icon: "Radio", level: 1 },
  { id: "cat-26-1", parentId: "cat-26", name: "Telecom & Internet Providers", slug: "telecom-internet-providers", level: 2 },
  { id: "cat-26-1-1", parentId: "cat-26-1", name: "Mobile Network Operator & SIMs", slug: "mobile-network-sim", level: 3 },
  { id: "cat-26-1-2", parentId: "cat-26-1", name: "Internet Service Provider (ISP) & Fiber", slug: "isp-fiber-broadband", level: 3 },

  // ==========================================
  // 27. Automotive
  // ==========================================
  { id: "cat-27", name: "Automotive", slug: "automotive", icon: "Car", level: 1, featured: true },
  { id: "cat-27-1", parentId: "cat-27", name: "Vehicle Sales & Dealerships", slug: "vehicle-sales-dealers", level: 2 },
  { id: "cat-27-1-1", parentId: "cat-27-1", name: "Car Dealership (New & Used)", slug: "car-dealership", level: 3 },
  { id: "cat-27-1-2", parentId: "cat-27-1", name: "Motorcycle & Commercial Trucks", slug: "motorcycle-truck-dealer", level: 3 },
  { id: "cat-27-2", parentId: "cat-27", name: "Auto Repair & Mechanics", slug: "auto-repair-mechanics", level: 2 },
  { id: "cat-27-2-1", parentId: "cat-27-2", name: "Auto Repair Shop & Diagnostics", slug: "auto-repair-diagnostics", level: 3 },
  { id: "cat-27-2-2", parentId: "cat-27-2", name: "Tire Shop & Wheel Alignment", slug: "tire-shop-alignment", level: 3 },
  { id: "cat-27-2-3", parentId: "cat-27-2", name: "Auto Body, Dent & Painting", slug: "auto-body-painting", level: 3 },
  { id: "cat-27-3", parentId: "cat-27", name: "Auto Services", slug: "auto-services", level: 2 },
  { id: "cat-27-3-1", parentId: "cat-27-3", name: "Car Wash & Detailing", slug: "car-wash-detailing", level: 3 },
  { id: "cat-27-3-2", parentId: "cat-27-3", name: "Car Rental & Towing Service", slug: "car-rental-towing", level: 3 },

  // ==========================================
  // 28. Transportation
  // ==========================================
  { id: "cat-28", name: "Transportation", slug: "transportation", icon: "Bus", level: 1 },
  { id: "cat-28-1", parentId: "cat-28", name: "Public & Private Transit", slug: "public-private-transit", level: 2 },
  { id: "cat-28-1-1", parentId: "cat-28-1", name: "Taxi & Ride-Hailing Service", slug: "taxi-ride-hailing", level: 3 },
  { id: "cat-28-1-2", parentId: "cat-28-1", name: "Bus & Coach Company", slug: "bus-coach-company", level: 3 },
  { id: "cat-28-1-3", parentId: "cat-28-1", name: "Train, Metro & Railway", slug: "train-metro-railway", level: 3 },

  // ==========================================
  // 29. Logistics & Delivery
  // ==========================================
  { id: "cat-29", name: "Logistics & Delivery", slug: "logistics-delivery", icon: "Truck", level: 1 },
  { id: "cat-29-1", parentId: "cat-29", name: "Courier & Freight Forwarding", slug: "courier-freight", level: 2 },
  { id: "cat-29-1-1", parentId: "cat-29-1", name: "Express Courier & Delivery", slug: "express-courier-delivery", level: 3 },
  { id: "cat-29-1-2", parentId: "cat-29-1", name: "Freight Forwarder & Cargo", slug: "freight-forwarder-cargo", level: 3 },
  { id: "cat-29-1-3", parentId: "cat-29-1", name: "Warehouse & Moving Company", slug: "warehouse-moving-company", level: 3 },

  // ==========================================
  // 30. Travel & Tourism
  // ==========================================
  { id: "cat-30", name: "Travel & Tourism", slug: "travel-tourism", icon: "Compass", level: 1, featured: true },
  { id: "cat-30-1", parentId: "cat-30", name: "Travel Agencies & Tours", slug: "travel-agencies-tours", level: 2 },
  { id: "cat-30-1-1", parentId: "cat-30-1", name: "Tour Operator & Safari", slug: "tour-operator-safari", level: 3 },
  { id: "cat-30-1-2", parentId: "cat-30-1", name: "Travel Agency & Flights", slug: "travel-agency-flights", level: 3 },
  { id: "cat-30-1-3", parentId: "cat-30-1", name: "Visa & Passport Services", slug: "visa-passport-services", level: 3 },

  // ==========================================
  // 31. Hotels & Accommodation
  // ==========================================
  { id: "cat-31", name: "Hotels & Accommodation", slug: "hotels-accommodation", icon: "Hotel", level: 1, featured: true },
  { id: "cat-31-1", parentId: "cat-31", name: "Lodging & Stays", slug: "lodging-stays", level: 2 },
  { id: "cat-31-1-1", parentId: "cat-31-1", name: "Luxury & 5-Star Hotel", slug: "luxury-hotel", level: 3 },
  { id: "cat-31-1-2", parentId: "cat-31-1", name: "Business & Boutique Hotel", slug: "business-boutique-hotel", level: 3 },
  { id: "cat-31-1-3", parentId: "cat-31-1", name: "Resort, Lodge & Eco-Stay", slug: "resort-lodge-ecostay", level: 3 },
  { id: "cat-31-1-4", parentId: "cat-31-1", name: "Guest House & Bed and Breakfast", slug: "guesthouse-bnb", level: 3 },
  { id: "cat-31-1-5", parentId: "cat-31-1", name: "Serviced Apartment & Villa", slug: "serviced-apartment-villa", level: 3 },

  // ==========================================
  // 32. Entertainment
  // ==========================================
  { id: "cat-32", name: "Entertainment & Arts", slug: "entertainment-arts", icon: "Film", level: 1 },
  { id: "cat-32-1", parentId: "cat-32", name: "Venues & Amusements", slug: "venues-amusements", level: 2 },
  { id: "cat-32-1-1", parentId: "cat-32-1", name: "Cinema & Movie Theater", slug: "cinema-theater", level: 3 },
  { id: "cat-32-1-2", parentId: "cat-32-1", name: "Concert Hall, Nightclub & Lounge", slug: "concert-nightclub-lounge", level: 3 },
  { id: "cat-32-1-3", parentId: "cat-32-1", name: "Amusement Park, Bowling & Arcade", slug: "amusement-bowling-arcade", level: 3 },
  { id: "cat-32-1-4", parentId: "cat-32-1", name: "Museum, Art Gallery & Zoo", slug: "museum-art-gallery", level: 3 },

  // ==========================================
  // 33. Sports & Fitness
  // ==========================================
  { id: "cat-33", name: "Sports & Fitness", slug: "sports-fitness", icon: "Dumbbell", level: 1 },
  { id: "cat-33-1", parentId: "cat-33", name: "Gyms & Studios", slug: "gyms-studios", level: 2 },
  { id: "cat-33-1-1", parentId: "cat-33-1", name: "Gym & Fitness Center", slug: "gym-fitness-center", level: 3 },
  { id: "cat-33-1-2", parentId: "cat-33-1", name: "Yoga, Pilates & Dance Studio", slug: "yoga-pilates-dance", level: 3 },
  { id: "cat-33-1-3", parentId: "cat-33-1", name: "Martial Arts & Boxing Gym", slug: "martial-arts-boxing", level: 3 },
  { id: "cat-33-1-4", parentId: "cat-33-1", name: "Swimming Pool, Tennis & Football Club", slug: "swimming-tennis-football", level: 3 },

  // ==========================================
  // 34. Events
  // ==========================================
  { id: "cat-34", name: "Events & Weddings", slug: "events-weddings", icon: "PartyPopper", level: 1 },
  { id: "cat-34-1", parentId: "cat-34", name: "Event Planning & Venues", slug: "event-planning-venues", level: 2 },
  { id: "cat-34-1-1", parentId: "cat-34-1", name: "Wedding Planner & Event Hall", slug: "wedding-planner-event-hall", level: 3 },
  { id: "cat-34-1-2", parentId: "cat-34-1", name: "Catering Service", slug: "catering-service", level: 3 },
  { id: "cat-34-1-3", parentId: "cat-34-1", name: "DJ, Sound & Stage Lighting Rental", slug: "dj-sound-lighting-rental", level: 3 },

  // ==========================================
  // 35. Photography & Media
  // ==========================================
  { id: "cat-35", name: "Photography & Media", slug: "photography-media", icon: "Camera", level: 1 },
  { id: "cat-35-1", parentId: "cat-35", name: "Studios & Production", slug: "studios-production", level: 2 },
  { id: "cat-35-1-1", parentId: "cat-35-1", name: "Photography Studio & Drone", slug: "photography-studio-drone", level: 3 },
  { id: "cat-35-1-2", parentId: "cat-35-1", name: "Video Production & Film", slug: "video-production-film", level: 3 },
  { id: "cat-35-1-3", parentId: "cat-35-1", name: "Audio Recording & Podcast Studio", slug: "audio-recording-podcast", level: 3 },

  // ==========================================
  // 36. Marketing & Advertising
  // ==========================================
  { id: "cat-36", name: "Marketing & Advertising", slug: "marketing-advertising", icon: "Megaphone", level: 1 },
  { id: "cat-36-1", parentId: "cat-36", name: "Agencies & Digital Media", slug: "agencies-digital-media", level: 2 },
  { id: "cat-36-1-1", parentId: "cat-36-1", name: "Digital Marketing & SEO Agency", slug: "digital-marketing-seo", level: 3 },
  { id: "cat-36-1-2", parentId: "cat-36-1", name: "Branding & Public Relations (PR)", slug: "branding-pr", level: 3 },
  { id: "cat-36-1-3", parentId: "cat-36-1", name: "Billboard & Outdoor Advertising", slug: "billboard-outdoor-ads", level: 3 },

  // ==========================================
  // 37. Printing & Publishing
  // ==========================================
  { id: "cat-37", name: "Printing & Publishing", slug: "printing-publishing", icon: "Printer", level: 1 },
  { id: "cat-37-1", parentId: "cat-37", name: "Press & Print Services", slug: "press-print-services", level: 2 },
  { id: "cat-37-1-1", parentId: "cat-37-1", name: "Digital & Large Format Printing", slug: "digital-large-format-printing", level: 3 },
  { id: "cat-37-1-2", parentId: "cat-37-1", name: "Packaging, Sign & Screen Printing", slug: "packaging-sign-printing", level: 3 },
  { id: "cat-37-1-3", parentId: "cat-37-1", name: "Book & Magazine Publisher", slug: "book-magazine-publisher", level: 3 },

  // ==========================================
  // 38. Agriculture
  // ==========================================
  { id: "cat-38", name: "Agriculture & Farming", slug: "agriculture-farming", icon: "Sprout", level: 1 },
  { id: "cat-38-1", parentId: "cat-38", name: "Farms & Plantations", slug: "farms-plantations", level: 2 },
  { id: "cat-38-1-1", parentId: "cat-38-1", name: "Crop, Grain & Vegetable Farm", slug: "crop-grain-vegetable-farm", level: 3 },
  { id: "cat-38-1-2", parentId: "cat-38-1", name: "Coffee & Tea Farm", slug: "coffee-tea-farm", level: 3 },
  { id: "cat-38-1-3", parentId: "cat-38-1", name: "Dairy, Poultry & Livestock Farm", slug: "dairy-poultry-livestock-farm", level: 3 },

  // ==========================================
  // 40. Manufacturing
  // ==========================================
  { id: "cat-40", name: "Manufacturing", slug: "manufacturing", icon: "Factory", level: 1 },
  { id: "cat-40-1", parentId: "cat-40", name: "Industrial Production", slug: "industrial-production", level: 2 },
  { id: "cat-40-1-1", parentId: "cat-40-1", name: "Food & Beverage Manufacturing", slug: "food-beverage-mfg", level: 3 },
  { id: "cat-40-1-2", parentId: "cat-40-1", name: "Textile, Garment & Leather Factory", slug: "textile-garment-leather-mfg", level: 3 },
  { id: "cat-40-1-3", parentId: "cat-40-1", name: "Metal, Plastic & Chemical Factory", slug: "metal-plastic-chemical-mfg", level: 3 },

  // ==========================================
  // 41. Industrial Services
  // ==========================================
  { id: "cat-41", name: "Industrial Services & Machinery", slug: "industrial-services-machinery", icon: "Cog", level: 1 },
  { id: "cat-41-1", parentId: "cat-41", name: "Fabrication & Automation", slug: "fabrication-automation", level: 2 },
  { id: "cat-41-1-1", parentId: "cat-41-1", name: "Welding, Metal Fabrication & CNC", slug: "welding-metal-fabrication", level: 3 },
  { id: "cat-41-1-2", parentId: "cat-41-1", name: "Industrial Equipment & Maintenance", slug: "industrial-equipment-maintenance", level: 3 },

  // ==========================================
  // 43. Environmental Services
  // ==========================================
  { id: "cat-43", name: "Environmental Services & Recycling", slug: "environmental-recycling", icon: "Recycle", level: 1 },
  { id: "cat-43-1", parentId: "cat-43", name: "Waste Management", slug: "waste-management", level: 2 },
  { id: "cat-43-1-1", parentId: "cat-43-1", name: "Recycling Center (Plastic, Metal, E-Waste)", slug: "recycling-center", level: 3 },
  { id: "cat-43-1-2", parentId: "cat-43-1", name: "Waste Collection & Water Treatment", slug: "waste-collection-water-treatment", level: 3 },

  // ==========================================
  // 44. Government & Public Services
  // ==========================================
  { id: "cat-44", name: "Government & Public Services", slug: "government-public-services", icon: "Landmark", level: 1 },
  { id: "cat-44-1", parentId: "cat-44", name: "Public Offices & Civil Services", slug: "public-offices-civil-services", level: 2 },
  { id: "cat-44-1-1", parentId: "cat-44-1", name: "Municipal & City Office", slug: "municipal-city-office", level: 3 },
  { id: "cat-44-1-2", parentId: "cat-44-1", name: "Passport & Immigration Office", slug: "passport-immigration-office", level: 3 },
  { id: "cat-44-1-3", parentId: "cat-44-1", name: "Post Office, Embassy & Consulate", slug: "post-office-embassy", level: 3 },

  // ==========================================
  // 45. Religious & Community Organizations
  // ==========================================
  { id: "cat-45", name: "Religious & Community Organizations", slug: "religious-community-organizations", icon: "Users", level: 1 },
  { id: "cat-45-1", parentId: "cat-45", name: "NGOs & Community Centers", slug: "ngos-community-centers", level: 2 },
  { id: "cat-45-1-1", parentId: "cat-45-1", name: "Nonprofit Organization & Charity", slug: "nonprofit-charity", level: 3 },
  { id: "cat-45-1-2", parentId: "cat-45-1", name: "Religious Institution & Cultural Center", slug: "religious-cultural-center", level: 3 },

  // ==========================================
  // 46. Security Services
  // ==========================================
  { id: "cat-46", name: "Security Services", slug: "security-services", icon: "Shield", level: 1 },
  { id: "cat-46-1", parentId: "cat-46", name: "Guard & Electronic Security", slug: "guard-electronic-security", level: 2 },
  { id: "cat-46-1-1", parentId: "cat-46-1", name: "Security Guard & Patrol Service", slug: "security-guard-patrol", level: 3 },
  { id: "cat-46-1-2", parentId: "cat-46-1", name: "CCTV & Alarm System Installation", slug: "cctv-alarm-installation", level: 3 },

  // ==========================================
  // 47. Employment & Human Resources
  // ==========================================
  { id: "cat-47", name: "Employment & Human Resources", slug: "employment-hr", icon: "UserCheck", level: 1 },
  { id: "cat-47-1", parentId: "cat-47", name: "Staffing & Recruiting", slug: "staffing-recruiting", level: 2 },
  { id: "cat-47-1-1", parentId: "cat-47-1", name: "Recruitment & Employment Agency", slug: "recruitment-employment-agency", level: 3 },
  { id: "cat-47-1-2", parentId: "cat-47-1", name: "Executive Search & HR Outsourcing", slug: "executive-search-hr", level: 3 },

  // ==========================================
  // 48. Cleaning Services
  // ==========================================
  { id: "cat-48", name: "Cleaning Services", slug: "cleaning-services", icon: "Sparkles", level: 1 },
  { id: "cat-48-1", parentId: "cat-48", name: "Janitorial & Deep Cleaning", slug: "janitorial-deep-cleaning", level: 2 },
  { id: "cat-48-1-1", parentId: "cat-48-1", name: "Residential & Office Cleaning", slug: "residential-office-cleaning", level: 3 },
  { id: "cat-48-1-2", parentId: "cat-48-1", name: "Carpet, Window & Post-Construction Clean", slug: "carpet-window-postconstruction", level: 3 },

  // ==========================================
  // 49. Repair & Maintenance
  // ==========================================
  { id: "cat-49", name: "Repair & Maintenance Services", slug: "repair-maintenance", icon: "Wrench", level: 1 },
  { id: "cat-49-1", parentId: "cat-49", name: "Item & Appliance Repairs", slug: "item-appliance-repairs", level: 2 },
  { id: "cat-49-1-1", parentId: "cat-49-1", name: "Refrigerator, Oven & Washer Repair", slug: "appliance-repair", level: 3 },
  { id: "cat-49-1-2", parentId: "cat-49-1", name: "Watch, Jewelry & Shoe Repair", slug: "watch-jewelry-shoe-repair", level: 3 },

  // ==========================================
  // 50. Rental Services
  // ==========================================
  { id: "cat-50", name: "Rental Services", slug: "rental-services", icon: "Key", level: 1 },
  { id: "cat-50-1", parentId: "cat-50", name: "Equipment & Event Rentals", slug: "equipment-event-rentals", level: 2 },
  { id: "cat-50-1-1", parentId: "cat-50-1", name: "Construction Equipment Rental", slug: "construction-equipment-rental", level: 3 },
  { id: "cat-50-1-2", parentId: "cat-50-1", name: "Party & Wedding Equipment Rental", slug: "party-wedding-rental", level: 3 },

  // ==========================================
  // 51. Personal Services
  // ==========================================
  { id: "cat-51", name: "Personal Services", slug: "personal-services", icon: "User", level: 1 },
  { id: "cat-51-1", parentId: "cat-51", name: "Care & Assistance", slug: "care-assistance", level: 2 },
  { id: "cat-51-1-1", parentId: "cat-51-1", name: "Dry Cleaning & Laundry Service", slug: "dry-cleaning-laundry", level: 3 },
  { id: "cat-51-1-2", parentId: "cat-51-1", name: "Childcare, Babysitting & Elder Care", slug: "childcare-elder-care", level: 3 },

  // ==========================================
  // 52. Funeral & Memorial Services
  // ==========================================
  { id: "cat-52", name: "Funeral & Memorial Services", slug: "funeral-memorial-services", icon: "Cross", level: 1 },
  { id: "cat-52-1", parentId: "cat-52", name: "Funeral Homes & Services", slug: "funeral-homes", level: 2 },
  { id: "cat-52-1-1", parentId: "cat-52-1", name: "Funeral Home & Director", slug: "funeral-home-director", level: 3 },
  { id: "cat-52-1-2", parentId: "cat-52-1", name: "Cemetery & Memorial Stone Supplier", slug: "cemetery-memorial-stone", level: 3 },



  // ==========================================
  // 55. Pets
  // ==========================================
  { id: "cat-55", name: "Pets & Pet Supplies", slug: "pets-pet-supplies", icon: "PawPrint", level: 1 },
  { id: "cat-55-1", parentId: "cat-55", name: "Pet Shops & Trainers", slug: "pet-shops-trainers", level: 2 },
  { id: "cat-55-1-1", parentId: "cat-55-1", name: "Pet Food & Accessories Store", slug: "pet-food-accessories", level: 3 },
  { id: "cat-55-1-2", parentId: "cat-55-1", name: "Dog Training & Pet Adoption Center", slug: "dog-training-adoption", level: 3 },

  // ==========================================
  // 56. Marine & Boating
  // ==========================================
  { id: "cat-56", name: "Marine & Boating", slug: "marine-boating", icon: "Anchor", level: 1 },
  { id: "cat-56-1", parentId: "cat-56", name: "Boats & Diving", slug: "boats-diving", level: 2 },
  { id: "cat-56-1-1", parentId: "cat-56-1", name: "Boat Dealer, Rental & Yacht Charter", slug: "boat-rental-yacht", level: 3 },
  { id: "cat-56-1-2", parentId: "cat-56-1", name: "Diving Center & Marine Equipment", slug: "diving-marine-equipment", level: 3 },

  // ==========================================
  // 57. Aviation
  // ==========================================
  { id: "cat-57", name: "Aviation & Airlines", slug: "aviation-airlines", icon: "Plane", level: 1 },
  { id: "cat-57-1", parentId: "cat-57", name: "Aviation Services", slug: "aviation-services", level: 2 },
  { id: "cat-57-1-1", parentId: "cat-57-1", name: "Airport & Commercial Airline", slug: "airport-commercial-airline", level: 3 },
  { id: "cat-57-1-2", parentId: "cat-57-1", name: "Aircraft Charter & Flight School", slug: "aircraft-charter-flight-school", level: 3 },

  // ==========================================
  // 58. Legal & Document Services
  // ==========================================
  { id: "cat-58", name: "Legal & Document Services", slug: "legal-document-services", icon: "FileText", level: 1 },
  { id: "cat-58-1", parentId: "cat-58", name: "Document Certification", slug: "document-certification", level: 2 },
  { id: "cat-58-1-1", parentId: "cat-58-1", name: "Certified Legal Translation", slug: "certified-legal-translation", level: 3 },
  { id: "cat-58-1-2", parentId: "cat-58-1", name: "Apostille, Scanning & Notary Service", slug: "apostille-notary-service", level: 3 },

  // ==========================================
  // 59. Translation & Language
  // ==========================================
  { id: "cat-59", name: "Translation & Language", slug: "translation-language", icon: "Languages", level: 1 },
  { id: "cat-59-1", parentId: "cat-59", name: "Language Services", slug: "language-services", level: 2 },
  { id: "cat-59-1-1", parentId: "cat-59-1", name: "Translation & Interpretation Agency", slug: "translation-interpretation-agency", level: 3 },
  { id: "cat-59-1-2", parentId: "cat-59-1", name: "Localization & Sign Language Interpreter", slug: "localization-sign-language", level: 3 },

  // ==========================================
  // 60. Specialized Business Services
  // ==========================================
  { id: "cat-60", name: "Specialized Business & Coworking", slug: "specialized-business-coworking", icon: "Building2", level: 1 },
  { id: "cat-60-1", parentId: "cat-60", name: "Coworking & Incubators", slug: "coworking-incubators", level: 2 },
  { id: "cat-60-1-1", parentId: "cat-60-1", name: "Coworking Space & Shared Office", slug: "coworking-space-shared-office", level: 3 },
  { id: "cat-60-1-2", parentId: "cat-60-1", name: "Business Incubator & Accelerator", slug: "incubator-accelerator", level: 3 },

  // ==========================================
  // 61. Office Services
  // ==========================================
  { id: "cat-61", name: "Office Services & Supplies", slug: "office-services-supplies", icon: "Paperclip", level: 1 },
  { id: "cat-61-1", parentId: "cat-61", name: "Office Supplies & Relocation", slug: "office-supplies-relocation", level: 2 },
  { id: "cat-61-1-1", parentId: "cat-61-1", name: "Office Stationery & Printer Supplier", slug: "stationery-printer-supplier", level: 3 },
  { id: "cat-61-1-2", parentId: "cat-61-1", name: "Office Relocation & Meeting Rooms", slug: "office-relocation-meeting-rooms", level: 3 },

  // ==========================================
  // 62. Industrial & Scientific
  // ==========================================
  { id: "cat-62", name: "Industrial & Scientific Laboratories", slug: "industrial-scientific-labs", icon: "FlaskConical", level: 1 },
  { id: "cat-62-1", parentId: "cat-62", name: "Scientific Testing", slug: "scientific-testing", level: 2 },
  { id: "cat-62-1-1", parentId: "cat-62-1", name: "Testing Laboratory & Quality Control", slug: "testing-lab-quality-control", level: 3 },
  { id: "cat-62-1-2", parentId: "cat-62-1", name: "Scientific & Lab Equipment Supplier", slug: "scientific-lab-equipment", level: 3 },

  // ==========================================
  // 63. Mining & Natural Resources
  // ==========================================
  { id: "cat-63", name: "Mining & Natural Resources", slug: "mining-natural-resources", icon: "Pickaxe", level: 1 },
  { id: "cat-63-1", parentId: "cat-63", name: "Mining & Extraction", slug: "mining-extraction", level: 2 },
  { id: "cat-63-1-1", parentId: "cat-63-1", name: "Mining Company (Gold, Copper, Gemstones)", slug: "mining-gold-copper-gemstones", level: 3 },
  { id: "cat-63-1-2", parentId: "cat-63-1", name: "Quarry, Stone & Sand Supplier", slug: "quarry-stone-sand", level: 3 },

  // ==========================================
  // 64. Oil & Gas
  // ==========================================
  { id: "cat-64", name: "Oil, Gas & Fuel Stations", slug: "oil-gas-fuel", icon: "Fuel", level: 1, featured: true },
  { id: "cat-64-1", parentId: "cat-64", name: "Fuel Stations & Distribution", slug: "fuel-stations-distribution", level: 2 },
  { id: "cat-64-1-1", parentId: "cat-64-1", name: "Gas & Petrol Station", slug: "gas-petrol-station", level: 3 },
  { id: "cat-64-1-2", parentId: "cat-64-1", name: "LPG Gas Supplier & Delivery", slug: "lpg-gas-supplier", level: 3 },
  { id: "cat-64-1-3", parentId: "cat-64-1", name: "Petroleum & Lubricant Distributor", slug: "petroleum-lubricant-distributor", level: 3 },

  // ==========================================
  // 65. Fashion Production
  // ==========================================
  { id: "cat-65", name: "Fashion Production & Garments", slug: "fashion-production-garments", icon: "Shirt", level: 1 },
  { id: "cat-65-1", parentId: "cat-65", name: "Textile Factories & Designers", slug: "textile-factories-designers", level: 2 },
  { id: "cat-65-1-1", parentId: "cat-65-1", name: "Garment & Textile Factory", slug: "garment-textile-factory", level: 3 },
  { id: "cat-65-1-2", parentId: "cat-65-1", name: "Fashion Designer & Pattern Maker", slug: "fashion-designer-pattern-maker", level: 3 },



  // ==========================================
  // 67. Education Supplies
  // ==========================================
  { id: "cat-67", name: "Education Supplies & Technology", slug: "education-supplies-tech", icon: "BookMarked", level: 1 },
  { id: "cat-67-1", parentId: "cat-67", name: "School Supplies & EdTech", slug: "school-supplies-edtech", level: 2 },
  { id: "cat-67-1-1", parentId: "cat-67-1", name: "School Supplies & Textbook Store", slug: "school-supplies-textbooks", level: 3 },
  { id: "cat-67-1-2", parentId: "cat-67-1", name: "Educational Technology & Platforms", slug: "edtech-online-learning", level: 3 },

  // ==========================================
  // 68. Child & Family Services
  // ==========================================
  { id: "cat-68", name: "Child & Family Services", slug: "child-family-services", icon: "Baby", level: 1 },
  { id: "cat-68-1", parentId: "cat-68", name: "Daycare & Kids Stores", slug: "daycare-kids-stores", level: 2 },
  { id: "cat-68-1-1", parentId: "cat-68-1", name: "Childcare, Daycare & Nursery", slug: "childcare-daycare-nursery", level: 3 },
  { id: "cat-68-1-2", parentId: "cat-68-1", name: "Toy Store & Baby Maternity Shop", slug: "toy-store-baby-maternity", level: 3 },

  // ==========================================
  // 69. Accessibility Services
  // ==========================================
  { id: "cat-69", name: "Accessibility Services", slug: "accessibility-services", icon: "Accessibility", level: 1 },
  { id: "cat-69-1", parentId: "cat-69", name: "Mobility & Assistive Devices", slug: "mobility-assistive-devices", level: 2 },
  { id: "cat-69-1-1", parentId: "cat-69-1", name: "Wheelchair & Mobility Equipment Supplier", slug: "wheelchair-mobility-supplier", level: 3 },
  { id: "cat-69-1-2", parentId: "cat-69-1", name: "Hearing Aid & Braille Services", slug: "hearing-aid-braille-services", level: 3 },

  // ==========================================
  // 70. Miscellaneous & Specialty Businesses
  // ==========================================
  { id: "cat-70", name: "Specialty & Miscellaneous", slug: "specialty-miscellaneous", icon: "Layers", level: 1 },
  { id: "cat-70-1", parentId: "cat-70", name: "Storage, Markets & Services", slug: "storage-markets-services", level: 2 },
  { id: "cat-70-1-1", parentId: "cat-70-1", name: "Self-Storage & Facility", slug: "self-storage-facility", level: 3 },
  { id: "cat-70-1-2", parentId: "cat-70-1", name: "Farmers & Flea Market", slug: "farmers-flea-market", level: 3 },
  { id: "cat-70-1-3", parentId: "cat-70-1", name: "Pawn Shop & Auction House", slug: "pawn-shop-auction", level: 3 },
  { id: "cat-70-1-4", parentId: "cat-70", name: "Coin Laundry & Laundromat", slug: "coin-laundry-laundromat", level: 3 },
];

export const SEED_CATEGORIES: Category[] = [
  ...SHOPS_RETAIL_CATEGORIES,
  ...SEED_CATEGORIES_BASE,
];

/**
 * Helper to build a complete nested Category Tree from the flat list
 */
export function getCategoryTree(): CategoryTree[] {
  const map = new Map<string, CategoryTree>();
  const roots: CategoryTree[] = [];

  SEED_CATEGORIES.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  SEED_CATEGORIES.forEach((cat) => {
    const node = map.get(cat.id);
    if (!node) return;

    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children!.push(node);
    } else if (cat.level === 1) {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Helper to find a category by its slug or ID
 */
export function getCategoryBySlug(slugOrId: string): Category | undefined {
  return SEED_CATEGORIES.find(
    (c) => c.slug === slugOrId || c.id === slugOrId
  );
}

/**
 * Helper to get breadcrumb lineage (Industry -> Category -> Subcategory -> Specialty)
 */
export function getCategoryBreadcrumbs(categoryIdOrSlug: string): Category[] {
  const result: Category[] = [];
  let current = getCategoryBySlug(categoryIdOrSlug);

  while (current) {
    result.unshift(current);
    if (!current.parentId) break;
    current = SEED_CATEGORIES.find((c) => c.id === current?.parentId);
  }

  return result;
}
