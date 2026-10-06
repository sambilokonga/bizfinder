export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  regionLabel: string; // e.g. "Region", "State", "Province", "County", "Emirate"
  subcityLabel: string; // e.g. "Sub-City", "District / Neighborhood", "Borough", "Locality"
  defaultCenter: [number, number]; // [lat, lng]
  defaultZoom: number;
  regions: {
    name: string;
    cities: {
      name: string;
      center?: [number, number];
      subcities?: string[];
    }[];
  }[];
  commonCities?: string[];
}

export const WORLD_COUNTRIES: CountryConfig[] = [
  {
    code: "ET",
    name: "Ethiopia",
    flag: "🇪🇹",
    regionLabel: "Region",
    subcityLabel: "Sub-City",
    defaultCenter: [9.010793, 38.761252],
    defaultZoom: 12,
    regions: [
      {
        name: "Addis Ababa",
        cities: [
          {
            name: "Addis Ababa",
            center: [9.010793, 38.761252],
            subcities: [
              "Bole",
              "Kirkos (Kazanchis)",
              "Arada (Piassa)",
              "Yeka (Megenagna)",
              "Lideta",
              "Nifas Silk-Lafto",
              "Kolfe Keranio",
              "Gullele",
              "Akaky Kaliti",
              "Addis Ketema",
              "Lemi Kura",
              "Bole Medhanialem",
              "Bole Atlas",
              "Bole Rwanda",
              "Sarbet (Old Airport)",
              "CMC / Ayat",
              "Gerji / Imperial",
              "Mexico Square",
              "22 Mazoria",
              "Saris",
              "Gotera",
              "Tor Hailoch",
            ],
          },
        ],
      },
      {
        name: "Oromia",
        cities: [
          { name: "Adama (Nazret)", center: [8.5414, 39.2689], subcities: ["Boku Shenen", "Dembela", "Lugo", "Melka Adama"] },
          { name: "Bishoftu (Debre Zeyit)", center: [8.7523, 38.9785], subcities: ["Hora Lake Area", "Babogaya", "Bishoftu Center"] },
          { name: "Jimma", center: [7.6734, 36.8344], subcities: ["Mendera", "Hermata", "Ginjo", "Jiren"] },
          { name: "Shashemene", center: [7.2008, 38.5985], subcities: ["Arada", "Abosto", "Jamaica Village"] },
          { name: "Burayu", center: [9.0833, 38.6833] },
          { name: "Sebeta", center: [8.9167, 38.6167] },
          { name: "Dukem", center: [8.7944, 38.9028] },
          { name: "Ambo", center: [8.9833, 37.85] },
          { name: "Bale Robe", center: [7.1167, 40.0] },
          { name: "Nekemte", center: [9.0833, 36.55] },
        ],
      },
      {
        name: "Amhara",
        cities: [
          { name: "Bahir Dar", center: [11.5936, 37.3908], subcities: ["Gish Abay", "Belay Zeleke", "Fasilo", "Tana", "Shimbit"] },
          { name: "Gondar", center: [12.6075, 37.4658], subcities: ["Fasil Ghebbi Area", "Maraki", "Azezo", "Arada"] },
          { name: "Dessie", center: [11.1333, 39.6333], subcities: ["Piazza", "Robit", "Hotie", "Menafesha"] },
          { name: "Debre Birhan", center: [9.6833, 39.5333] },
          { name: "Debre Markos", center: [10.3333, 37.7333] },
          { name: "Kombolcha", center: [11.0833, 39.7333] },
          { name: "Woldiya", center: [11.8333, 39.6] },
          { name: "Lalibela", center: [12.0333, 39.05] },
        ],
      },
      {
        name: "Sidama",
        cities: [
          { name: "Hawassa", center: [7.0504, 38.4763], subcities: ["Meneharia", "Tabor", "Hayk Dar", "Misrak", "Mehal Ketema"] },
          { name: "Yirgalem", center: [6.75, 38.4167] },
          { name: "Leku", center: [6.8667, 38.45] },
        ],
      },
      {
        name: "Tigray",
        cities: [
          { name: "Mekelle", center: [13.4967, 39.4753], subcities: ["Kedamay Weyane", "Hadnet", "Ayder", "Hawelti", "Semien"] },
          { name: "Adigrat", center: [14.277, 39.462] },
          { name: "Axum", center: [14.123, 38.724] },
          { name: "Shire (Inda Selassie)", center: [14.1, 38.2833] },
        ],
      },
      {
        name: "Dire Dawa",
        cities: [
          { name: "Dire Dawa", center: [9.5931, 41.8661], subcities: ["Sabian", "Megala", "Gende Kore", "Kazira", "Melka Jebdu"] },
        ],
      },
      {
        name: "Somali",
        cities: [
          { name: "Jigjiga", center: [9.35, 42.8], subcities: ["Dudumad", "Kebele 01", "Kebele 02", "Kebele 06"] },
          { name: "Gode", center: [5.95, 43.55] },
          { name: "Kebri Dahar", center: [6.7333, 44.2833] },
          { name: "Degehabur", center: [8.2167, 43.5667] },
        ],
      },
      {
        name: "Central Ethiopia",
        cities: [
          { name: "Hosaena", center: [7.55, 37.85], subcities: ["Sech Duna", "Arada", "Gofer Meda"] },
          { name: "Worabe", center: [7.85, 38.2], subcities: ["Worabe Center", "Alcho"] },
          { name: "Wolkite", center: [8.2833, 37.7833], subcities: ["Gubrye", "Wolkite Center"] },
          { name: "Butajira", center: [8.1167, 38.3667], subcities: ["Batu", "Butajira Center"] },
          { name: "Durame", center: [7.2333, 37.9667] },
          { name: "Halaba Kulito", center: [7.3167, 38.0833] },
        ],
      },
      {
        name: "South Ethiopia",
        cities: [
          { name: "Wolaita Sodo", center: [6.86, 37.76], subcities: ["Mehal Sodo", "Arada", "Merkato", "Kera"] },
          { name: "Arba Minch", center: [6.0333, 37.55], subcities: ["Sikela", "Secha", "Limat"] },
          { name: "Dilla", center: [6.4167, 38.3167], subcities: ["Buno", "Chichu", "Dilla Center"] },
          { name: "Sawla", center: [6.3, 36.5833] },
          { name: "Jinka", center: [5.65, 36.5667] },
        ],
      },
      {
        name: "Harari",
        cities: [
          { name: "Harar", center: [9.3139, 42.1182], subcities: ["Jugol (Old Walled City)", "Aboker", "Shenkor", "Amir Nur"] },
        ],
      },
      {
        name: "Afar",
        cities: [
          { name: "Semera", center: [11.794, 41.008] },
          { name: "Awash", center: [8.9833, 40.1667] },
          { name: "Asaita", center: [11.5667, 41.4333] },
        ],
      },
      {
        name: "Benishangul-Gumuz",
        cities: [
          { name: "Asosa", center: [10.0667, 34.5333] },
        ],
      },
      {
        name: "Gambela",
        cities: [
          { name: "Gambela", center: [8.25, 34.5833] },
        ],
      },
      {
        name: "Southwest Ethiopia",
        cities: [
          { name: "Bonga", center: [7.2833, 36.2333] },
          { name: "Mizan Teferi", center: [6.998, 35.586] },
          { name: "Tepi", center: [7.2, 35.4167] },
        ],
      },
    ],
  },
  {
    code: "US",
    name: "United States of America",
    flag: "🇺🇸",
    regionLabel: "State",
    subcityLabel: "District / Neighborhood",
    defaultCenter: [37.0902, -95.7129],
    defaultZoom: 4,
    regions: [
      {
        name: "California",
        cities: [
          { name: "Los Angeles", center: [34.0522, -118.2437], subcities: ["Downtown LA", "Hollywood", "Beverly Hills Area", "Santa Monica", "Venice", "Silver Lake", "Koreatown"] },
          { name: "San Francisco", center: [37.7749, -122.4194], subcities: ["Financial District", "Mission District", "SoMa", "Fisherman's Wharf", "Marina", "Castro"] },
          { name: "San Jose (Silicon Valley)", center: [37.3382, -121.8863], subcities: ["Downtown", "Santana Row", "North San Jose", "Willow Glen"] },
          { name: "San Diego", center: [32.7157, -117.1611], subcities: ["Gaslamp Quarter", "La Jolla", "Pacific Beach", "North Park", "Little Italy"] },
          { name: "Sacramento", center: [38.5816, -121.4944] },
          { name: "Oakland", center: [37.8044, -122.2712] },
        ],
      },
      {
        name: "New York",
        cities: [
          { name: "New York City", center: [40.7128, -74.006], subcities: ["Manhattan (Midtown)", "Manhattan (Downtown / Wall St)", "SoHo / Tribeca", "Brooklyn (Williamsburg)", "Brooklyn (DUMBO)", "Queens (Astoria)", "Bronx"] },
          { name: "Buffalo", center: [42.8864, -78.8784] },
          { name: "Albany", center: [42.6526, -73.7562] },
          { name: "Rochester", center: [43.1566, -77.6088] },
        ],
      },
      {
        name: "Texas",
        cities: [
          { name: "Houston", center: [29.7604, -95.3698], subcities: ["Downtown", "Galleria / Uptown", "Montrose", "The Heights", "Medical Center"] },
          { name: "Austin", center: [30.2672, -97.7431], subcities: ["Downtown / 6th St", "South Congress (SoCo)", "East Austin", "Domain"] },
          { name: "Dallas", center: [32.7767, -96.797], subcities: ["Downtown", "Uptown", "Deep Ellum", "Bishop Arts District"] },
          { name: "San Antonio", center: [29.4241, -98.4936], subcities: ["River Walk Area", "Pearl District", "Downtown"] },
          { name: "Fort Worth", center: [32.7555, -97.3308] },
        ],
      },
      {
        name: "Florida",
        cities: [
          { name: "Miami", center: [25.7617, -80.1918], subcities: ["Brickell", "Downtown", "Wynwood", "South Beach Area", "Design District", "Coral Gables"] },
          { name: "Orlando", center: [28.5383, -81.3792], subcities: ["Downtown", "Lake Nona", "Winter Park"] },
          { name: "Tampa", center: [27.9506, -82.4572], subcities: ["Ybor City", "Downtown", "Hyde Park"] },
          { name: "Fort Lauderdale", center: [26.1224, -80.1373] },
        ],
      },
      {
        name: "Washington",
        cities: [
          { name: "Seattle", center: [47.6062, -122.3321], subcities: ["Downtown", "Capitol Hill", "Ballard", "South Lake Union", "Pioneer Square"] },
          { name: "Bellevue", center: [47.6101, -122.2015] },
          { name: "Spokane", center: [47.6588, -117.426] },
        ],
      },
      {
        name: "Illinois",
        cities: [
          { name: "Chicago", center: [41.8781, -87.6298], subcities: ["The Loop", "River North", "West Loop", "Lincoln Park", "Wicker Park"] },
        ],
      },
      {
        name: "Massachusetts",
        cities: [
          { name: "Boston", center: [42.3601, -71.0589], subcities: ["Back Bay", "Beacon Hill", "Seaport District", "South End", "North End"] },
          { name: "Cambridge", center: [42.3736, -71.1097], subcities: ["Harvard Square", "Kendall Square", "Central Square"] },
        ],
      },
      {
        name: "Georgia",
        cities: [
          { name: "Atlanta", center: [33.749, -84.388], subcities: ["Midtown", "Buckhead", "Downtown", "Inman Park", "Old Fourth Ward"] },
        ],
      },
      {
        name: "District of Columbia",
        cities: [
          { name: "Washington D.C.", center: [38.9072, -77.0369], subcities: ["Georgetown", "Dupont Circle", "Capitol Hill", "Downtown", "Adams Morgan"] },
        ],
      },
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    regionLabel: "Country / Region",
    subcityLabel: "Borough / District",
    defaultCenter: [55.3781, -3.436],
    defaultZoom: 6,
    regions: [
      {
        name: "Greater London (England)",
        cities: [
          {
            name: "London",
            center: [51.5074, -0.1278],
            subcities: [
              "City of London",
              "Westminster",
              "Camden",
              "Kensington & Chelsea",
              "Islington",
              "Hackney & Shoreditch",
              "Southwark / London Bridge",
              "Greenwich",
              "Canary Wharf",
              "Soho & Covent Garden",
              "Mayfair & Marylebone",
            ],
          },
        ],
      },
      {
        name: "North West (England)",
        cities: [
          { name: "Manchester", center: [53.4808, -2.2426], subcities: ["Northern Quarter", "Spinningfields", "Ancoats", "Deansgate", "Didsbury"] },
          { name: "Liverpool", center: [53.4084, -2.9916], subcities: ["City Centre", "Baltic Triangle", "Ropewalks", "Albert Dock"] },
        ],
      },
      {
        name: "West Midlands (England)",
        cities: [
          { name: "Birmingham", center: [52.4862, -1.8904], subcities: ["City Centre", "Jewellery Quarter", "Digbeth", "Edgbaston"] },
        ],
      },
      {
        name: "Scotland",
        cities: [
          { name: "Edinburgh", center: [55.9533, -3.1883], subcities: ["Old Town", "New Town", "Leith", "Stockbridge", "West End"] },
          { name: "Glasgow", center: [55.8642, -4.2518], subcities: ["City Centre", "West End", "Merchant City", "Southside"] },
        ],
      },
      {
        name: "Wales",
        cities: [
          { name: "Cardiff", center: [51.4816, -3.1791], subcities: ["City Centre", "Cardiff Bay", "Roath", "Cathays"] },
        ],
      },
      {
        name: "Northern Ireland",
        cities: [
          { name: "Belfast", center: [54.5973, -5.9301], subcities: ["Cathedral Quarter", "Titanic Quarter", "City Centre", "Queen's Quarter"] },
        ],
      },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    regionLabel: "Province / Territory",
    subcityLabel: "District / Neighborhood",
    defaultCenter: [56.1304, -106.3468],
    defaultZoom: 4,
    regions: [
      {
        name: "Ontario",
        cities: [
          { name: "Toronto", center: [43.6532, -79.3832], subcities: ["Downtown / Financial District", "Yorkville", "Queen West", "Distillery District", "North York", "Scarborough"] },
          { name: "Ottawa", center: [45.4215, -75.6972], subcities: ["ByWard Market", "Centretown", "The Glebe", "Kanata"] },
          { name: "Mississauga", center: [43.589, -79.6441] },
        ],
      },
      {
        name: "Quebec",
        cities: [
          { name: "Montreal", center: [45.5017, -73.5673], subcities: ["Downtown Montreal", "Old Montreal (Vieux-Montréal)", "Plateau-Mont-Royal", "Mile End", "Griffintown"] },
          { name: "Quebec City", center: [46.8139, -71.208] },
        ],
      },
      {
        name: "British Columbia",
        cities: [
          { name: "Vancouver", center: [49.2827, -123.1207], subcities: ["Downtown", "Yaletown", "Gastown", "Kitsilano", "West End", "Mount Pleasant"] },
          { name: "Victoria", center: [48.4284, -123.3656] },
          { name: "Richmond", center: [49.1666, -123.1336] },
        ],
      },
      {
        name: "Alberta",
        cities: [
          { name: "Calgary", center: [51.0447, -114.0719], subcities: ["Downtown", "Beltline", "Kensington", "Inglewood"] },
          { name: "Edmonton", center: [53.5461, -113.4938], subcities: ["Downtown", "Old Strathcona", "Oliver"] },
        ],
      },
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    regionLabel: "County",
    subcityLabel: "Sub-County / Area",
    defaultCenter: [-1.292066, 36.821946],
    defaultZoom: 11,
    regions: [
      {
        name: "Nairobi County",
        cities: [
          {
            name: "Nairobi",
            center: [-1.2921, 36.8219],
            subcities: [
              "Westlands",
              "Kilimani",
              "Karen",
              "Upper Hill",
              "Nairobi CBD",
              "Gigiri (UN Area)",
              "Lavington",
              "Parklands",
              "Kileleshwa",
              "Eastleigh",
              "Langata",
            ],
          },
        ],
      },
      {
        name: "Mombasa County",
        cities: [
          { name: "Mombasa", center: [-4.0435, 39.6682], subcities: ["Nyali", "Old Town", "Bamburi", "Mvita", "Likoni", "Changamwe"] },
        ],
      },
      {
        name: "Kisumu County",
        cities: [
          { name: "Kisumu", center: [-0.0917, 34.768], subcities: ["Milimani", "CBD", "Kondele", "Riat"] },
        ],
      },
      {
        name: "Nakuru County",
        cities: [
          { name: "Nakuru", center: [-0.3031, 36.08] },
          { name: "Naivasha", center: [-0.7172, 36.431] },
        ],
      },
      {
        name: "Uasin Gishu County",
        cities: [
          { name: "Eldoret", center: [0.5143, 35.2698] },
        ],
      },
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    regionLabel: "Emirate",
    subcityLabel: "District / Zone",
    defaultCenter: [25.2048, 55.2708],
    defaultZoom: 10,
    regions: [
      {
        name: "Dubai",
        cities: [
          {
            name: "Dubai",
            center: [25.2048, 55.2708],
            subcities: [
              "Downtown Dubai (Burj Khalifa)",
              "Dubai Marina",
              "Business Bay",
              "Palm Jumeirah",
              "Jumeirah Beach Residence (JBR)",
              "DIFC (Financial Centre)",
              "Deira",
              "Bur Dubai",
              "Jumeirah",
              "Al Barsha",
              "Dubai Hills",
            ],
          },
        ],
      },
      {
        name: "Abu Dhabi",
        cities: [
          {
            name: "Abu Dhabi",
            center: [24.4539, 54.3773],
            subcities: [
              "Corniche",
              "Yas Island",
              "Al Reem Island",
              "Saadiyat Island",
              "Al Maryah Island (ADGM)",
              "Downtown Abu Dhabi",
            ],
          },
          { name: "Al Ain", center: [24.1302, 55.8023] },
        ],
      },
      {
        name: "Sharjah",
        cities: [
          { name: "Sharjah", center: [25.3463, 55.4209], subcities: ["Al Majaz", "Al Nahda", "Al Qasba", "Muwaileh"] },
        ],
      },
    ],
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    regionLabel: "Federal State (Bundesland)",
    subcityLabel: "District / Borough (Bezirk)",
    defaultCenter: [51.1657, 10.4515],
    defaultZoom: 6,
    regions: [
      {
        name: "Berlin",
        cities: [
          { name: "Berlin", center: [52.52, 13.405], subcities: ["Mitte", "Friedrichshain-Kreuzberg", "Charlottenburg-Wilmersdorf", "Pankow (Prenzlauer Berg)", "Neukölln", "Schöneberg"] },
        ],
      },
      {
        name: "Bavaria (Bayern)",
        cities: [
          { name: "Munich (München)", center: [48.1351, 11.582], subcities: ["Altstadt-Lehel", "Maxvorstadt", "Schwabing", "Ludwigsvorstadt-Isarvorstadt", "Bogenhausen"] },
          { name: "Nuremberg (Nürnberg)", center: [49.4521, 11.0767] },
        ],
      },
      {
        name: "North Rhine-Westphalia (NRW)",
        cities: [
          { name: "Cologne (Köln)", center: [50.9375, 6.9603], subcities: ["Innenstadt", "Ehrenfeld", "Lindenthal", "Nippes"] },
          { name: "Düsseldorf", center: [51.2277, 6.7735], subcities: ["Altstadt", "Stadtmitte", "MedienHafen", "Oberkassel"] },
        ],
      },
      {
        name: "Hesse (Hessen)",
        cities: [
          { name: "Frankfurt am Main", center: [50.1109, 8.6821], subcities: ["Bankenviertel / Innenstadt", "Sachsenhausen", "Westend", "Nordend", "Bornheim"] },
        ],
      },
      {
        name: "Hamburg",
        cities: [
          { name: "Hamburg", center: [53.5511, 9.9937], subcities: ["Hamburg-Mitte", "Altona", "HafenCity", "St. Pauli", "Eimsbüttel"] },
        ],
      },
    ],
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    regionLabel: "Region / Department",
    subcityLabel: "Arrondissement / District",
    defaultCenter: [46.2276, 2.2137],
    defaultZoom: 6,
    regions: [
      {
        name: "Île-de-France",
        cities: [
          {
            name: "Paris",
            center: [48.8566, 2.3522],
            subcities: [
              "1er (Louvre / Palais-Royal)",
              "4e (Le Marais)",
              "5e (Quartier Latin)",
              "6e (Saint-Germain-des-Prés)",
              "8e (Champs-Élysées)",
              "9e (Opéra)",
              "11e (Bastille / République)",
              "18e (Montmartre)",
              "La Défense Area",
            ],
          },
        ],
      },
      {
        name: "Auvergne-Rhône-Alpes",
        cities: [
          { name: "Lyon", center: [45.764, 4.8357], subcities: ["Presqu'île (1er & 2e)", "Vieux Lyon (5e)", "Part-Dieu (3e)", "Croix-Rousse (4e)"] },
        ],
      },
      {
        name: "Provence-Alpes-Côte d'Azur",
        cities: [
          { name: "Marseille", center: [43.2965, 5.3698], subcities: ["Vieux-Port", "Le Panier", "Prado", "La Joliette"] },
          { name: "Nice", center: [43.7102, 7.262], subcities: ["Promenade des Anglais", "Vieux Nice", "Cimiez"] },
        ],
      },
    ],
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    regionLabel: "State / Union Territory",
    subcityLabel: "Locality / Area",
    defaultCenter: [20.5937, 78.9629],
    defaultZoom: 5,
    regions: [
      {
        name: "Maharashtra",
        cities: [
          { name: "Mumbai", center: [19.076, 72.8777], subcities: ["Bandra West", "Andheri", "Bandra Kurla Complex (BKC)", "South Mumbai (Colaba/Nariman Point)", "Powai", "Juhu"] },
          { name: "Pune", center: [18.5204, 73.8567], subcities: ["Koregaon Park", "Kalyani Nagar", "Hinjawadi", "Baner", "Viman Nagar"] },
        ],
      },
      {
        name: "Karnataka",
        cities: [
          { name: "Bengaluru (Bangalore)", center: [12.9716, 77.5946], subcities: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Electronic City", "MG Road / CBD", "Jayanagar"] },
        ],
      },
      {
        name: "Delhi NCT",
        cities: [
          { name: "New Delhi / NCR", center: [28.6139, 77.209], subcities: ["Connaught Place (CP)", "South Extension", "Hauz Khas", "Saket", "Aerocity", "Cyber City (Gurugram)", "Noida Sector 18"] },
        ],
      },
      {
        name: "Telangana",
        cities: [
          { name: "Hyderabad", center: [17.385, 78.4867], subcities: ["Hitec City", "Gachibowli", "Jubilee Hills", "Banjara Hills", "Madhapur"] },
        ],
      },
    ],
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    regionLabel: "State / Territory",
    subcityLabel: "Suburb / District",
    defaultCenter: [-25.2744, 133.7751],
    defaultZoom: 4,
    regions: [
      {
        name: "New South Wales",
        cities: [
          { name: "Sydney", center: [-33.8688, 151.2093], subcities: ["Sydney CBD", "Surry Hills", "Bondi Beach Area", "Paddington", "Barangaroo", "Parramatta", "Manly"] },
        ],
      },
      {
        name: "Victoria",
        cities: [
          { name: "Melbourne", center: [-37.8136, 144.9631], subcities: ["Melbourne CBD", "Southbank", "Fitzroy", "St Kilda", "Richmond", "Carlton", "South Yarra"] },
        ],
      },
      {
        name: "Queensland",
        cities: [
          { name: "Brisbane", center: [-27.4698, 153.0251], subcities: ["Brisbane CBD", "Fortitude Valley", "South Bank", "New Farm"] },
          { name: "Gold Coast", center: [-28.0167, 153.4] },
        ],
      },
    ],
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    regionLabel: "Province",
    subcityLabel: "Suburb / District",
    defaultCenter: [-30.5595, 22.9375],
    defaultZoom: 5,
    regions: [
      {
        name: "Gauteng",
        cities: [
          { name: "Johannesburg", center: [-26.2041, 28.0473], subcities: ["Sandton", "Rosebank", "Johannesburg CBD", "Maboneng", "Fourways", "Melville"] },
          { name: "Pretoria (Tshwane)", center: [-25.7479, 28.2293], subcities: ["Menlyn", "Hatfield", "Brooklyn", "Centurion"] },
        ],
      },
      {
        name: "Western Cape",
        cities: [
          { name: "Cape Town", center: [-33.9249, 18.4241], subcities: ["City Bowl / CBD", "V&A Waterfront", "Camps Bay", "Sea Point", "Green Point", "Woodstock"] },
        ],
      },
      {
        name: "KwaZulu-Natal",
        cities: [
          { name: "Durban", center: [-29.8587, 31.0218], subcities: ["Umhlanga", "Florida Road / Morningside", "Durban North", "CBD"] },
        ],
      },
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    regionLabel: "State",
    subcityLabel: "Local Government / Area",
    defaultCenter: [9.082, 8.6753],
    defaultZoom: 6,
    regions: [
      {
        name: "Lagos State",
        cities: [
          { name: "Lagos", center: [6.5244, 3.3792], subcities: ["Victoria Island (VI)", "Lekki Phase 1", "Ikoyi", "Ikeja / Allen Avenue", "Surulere", "Yaba (Tech Hub)", "Ajah"] },
        ],
      },
      {
        name: "Federal Capital Territory (FCT)",
        cities: [
          { name: "Abuja", center: [9.0765, 7.3986], subcities: ["Maitama", "Wuse 2", "Garki", "Asokoro", "Jabi", "Central Business District"] },
        ],
      },
      {
        name: "Rivers State",
        cities: [
          { name: "Port Harcourt", center: [4.8156, 7.0498], subcities: ["Old GRA", "New GRA", "Trans Amadi", "Peter Odili Road"] },
        ],
      },
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    regionLabel: "Province / Region",
    subcityLabel: "District (Hayy)",
    defaultCenter: [23.8859, 45.0792],
    defaultZoom: 5,
    regions: [
      {
        name: "Riyadh Province",
        cities: [
          { name: "Riyadh", center: [24.7136, 46.6753], subcities: ["Olaya", "Al Nakheel", "Al Malqa", "KAFD (King Abdullah Financial District)", "Al Yasmin", "Al Sulaimaniyah"] },
        ],
      },
      {
        name: "Makkah Province",
        cities: [
          { name: "Jeddah", center: [21.4858, 39.1925], subcities: ["Al Corniche", "Al Rawdah", "Al Zahra", "Al Andalus", "Al Balad (Historic)"] },
          { name: "Makkah", center: [21.3891, 39.8579] },
        ],
      },
    ],
  },
  {
    code: "EG",
    name: "Egypt",
    flag: "🇪🇬",
    regionLabel: "Governorate",
    subcityLabel: "District / Neighborhood (Kism)",
    defaultCenter: [26.8206, 30.8025],
    defaultZoom: 6,
    regions: [
      {
        name: "Cairo Governorate",
        cities: [
          { name: "Cairo", center: [30.0444, 31.2357], subcities: ["Zamalek", "Downtown / Tahrir", "New Cairo / Fifth Settlement", "Maadi", "Heliopolis (Masr El Gedida)", "Nasr City"] },
        ],
      },
      {
        name: "Giza Governorate",
        cities: [
          { name: "Giza / 6th of October", center: [30.0131, 31.2089], subcities: ["Sheikh Zayed City", "6th of October City", "Dokki", "Mohandessin", "Pyramids Area"] },
        ],
      },
      {
        name: "Alexandria Governorate",
        cities: [
          { name: "Alexandria", center: [31.2001, 29.9187], subcities: ["Corniche / Stanley", "Mansheya", "Smouha", "Gleem", "Sidi Gaber"] },
        ],
      },
    ],
  },
  {
    code: "TR",
    name: "Turkey",
    flag: "🇹🇷",
    regionLabel: "Province (İl)",
    subcityLabel: "District (İlçe / Mahalle)",
    defaultCenter: [38.9637, 35.2433],
    defaultZoom: 6,
    regions: [
      {
        name: "Istanbul",
        cities: [
          { name: "Istanbul", center: [41.0082, 28.9784], subcities: ["Kadıköy", "Beşiktaş", "Beyoğlu (Taksim)", "Şişli", "Fatih (Sultanahmet)", "Üsküdar", "Levent / Maslak"] },
        ],
      },
      {
        name: "Ankara",
        cities: [
          { name: "Ankara", center: [39.9334, 32.8597], subcities: ["Çankaya", "Kızılay", "Tunalı Hilmi", "Yenimahalle"] },
        ],
      },
    ],
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    regionLabel: "Prefecture (Todōfuken)",
    subcityLabel: "Ward / District (Ku / Chō)",
    defaultCenter: [36.2048, 138.2529],
    defaultZoom: 5,
    regions: [
      {
        name: "Tokyo",
        cities: [
          { name: "Tokyo", center: [35.6762, 139.6503], subcities: ["Shibuya", "Shinjuku", "Minato (Roppongi/Akasaka)", "Chiyoda (Marunouchi/Ginza)", "Chuo (Nihonbashi)", "Taito (Asakusa/Ueno)"] },
        ],
      },
      {
        name: "Osaka",
        cities: [
          { name: "Osaka", center: [34.6937, 135.5023], subcities: ["Kita (Umeda)", "Chuo (Namba/Shinsaibashi)", "Tennoji"] },
        ],
      },
    ],
  },
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    regionLabel: "Province / Municipality",
    subcityLabel: "District (Qu)",
    defaultCenter: [35.8617, 104.1954],
    defaultZoom: 4,
    regions: [
      {
        name: "Beijing",
        cities: [{ name: "Beijing", center: [39.9042, 116.4074], subcities: ["Chaoyang (CBD/Sanlitun)", "Haidian (Zhongguancun)", "Dongcheng", "Xicheng"] }],
      },
      {
        name: "Shanghai",
        cities: [{ name: "Shanghai", center: [31.2304, 121.4737], subcities: ["Pudong (Lujiazui)", "Huangpu (The Bund)", "Jing'an", "Xuhui (French Concession)"] }],
      },
    ],
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    regionLabel: "State (Estado)",
    subcityLabel: "Neighborhood (Bairro)",
    defaultCenter: [-14.235, -51.9253],
    defaultZoom: 4,
    regions: [
      {
        name: "São Paulo",
        cities: [{ name: "São Paulo", center: [-23.5505, -46.6333], subcities: ["Avenida Paulista", "Itaim Bibi", "Vila Madalena", "Pinheiros", "Moema", "Jardins"] }],
      },
      {
        name: "Rio de Janeiro",
        cities: [{ name: "Rio de Janeiro", center: [-22.9068, -43.1729], subcities: ["Copacabana", "Ipanema", "Leblon", "Botafogo", "Barra da Tijuca", "Centro"] }],
      },
    ],
  },
  {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    regionLabel: "Region (Regione)",
    subcityLabel: "District / Quartiere",
    defaultCenter: [41.8719, 12.5674],
    defaultZoom: 6,
    regions: [
      {
        name: "Lazio",
        cities: [{ name: "Rome (Roma)", center: [41.9028, 12.4964], subcities: ["Centro Storico (Trastevere)", "Prati / Vatican", "Monti", "Flaminio", "EUR"] }],
      },
      {
        name: "Lombardy",
        cities: [{ name: "Milan (Milano)", center: [45.4642, 9.19], subcities: ["Duomo / Centro", "Brera", "Navigli", "Porta Nuova", "Isola"] }],
      },
    ],
  },
  {
    code: "ES",
    name: "Spain",
    flag: "🇪🇸",
    regionLabel: "Autonomous Community (Comunidad)",
    subcityLabel: "District / Barrio",
    defaultCenter: [40.4637, -3.7492],
    defaultZoom: 6,
    regions: [
      {
        name: "Community of Madrid",
        cities: [{ name: "Madrid", center: [40.4168, -3.7038], subcities: ["Centro / Sol", "Salamanca", "Malasaña", "Chueca", "Chamberí", "Retiro"] }],
      },
      {
        name: "Catalonia",
        cities: [{ name: "Barcelona", center: [41.3879, 2.1699], subcities: ["Eixample", "Gothic Quarter (Barri Gòtic)", "El Born", "Gràcia", "Poblenou", "Barceloneta"] }],
      },
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    regionLabel: "Province",
    subcityLabel: "District (Stadsdeel / Buurt)",
    defaultCenter: [52.1326, 5.2913],
    defaultZoom: 7,
    regions: [
      {
        name: "North Holland",
        cities: [{ name: "Amsterdam", center: [52.3676, 4.9041], subcities: ["Centrum (Canal Ring)", "De Pijp / Zuid", "Jordaan", "Oud-West", "Zuidas (Financial District)"] }],
      },
      {
        name: "South Holland",
        cities: [
          { name: "Rotterdam", center: [51.9244, 4.4777], subcities: ["Centrum", "Kop van Zuid", "Delfshaven"] },
          { name: "The Hague (Den Haag)", center: [52.0705, 4.3007] },
        ],
      },
    ],
  },
  {
    code: "SE",
    name: "Sweden",
    flag: "🇸🇪",
    regionLabel: "County (Län)",
    subcityLabel: "District (Stadsdelsområde)",
    defaultCenter: [60.1282, 18.6435],
    defaultZoom: 5,
    regions: [
      {
        name: "Stockholm County",
        cities: [{ name: "Stockholm", center: [59.3293, 18.0686], subcities: ["Norrmalm / City", "Södermalm", "Östermalm", "Gamla Stan", "Kungsholmen"] }],
      },
      {
        name: "Västra Götaland",
        cities: [{ name: "Gothenburg (Göteborg)", center: [57.7089, 11.9746], subcities: ["Centrum", "Majorna-Linné", "Haga"] }],
      },
    ],
  },
  {
    code: "CH",
    name: "Switzerland",
    flag: "🇨🇭",
    regionLabel: "Canton",
    subcityLabel: "District / Quarter (Kreis)",
    defaultCenter: [46.8182, 8.2275],
    defaultZoom: 7,
    regions: [
      {
        name: "Zurich",
        cities: [{ name: "Zurich", center: [47.3769, 8.5417], subcities: ["Altstadt (Kreis 1)", "Aussersihl (Kreis 4)", "Industriequartier (Kreis 5)", "Fluntern / Hottingen"] }],
      },
      {
        name: "Geneva",
        cities: [{ name: "Geneva", center: [46.2044, 6.1432], subcities: ["Cité-Centre", "Eaux-Vives", "Plainpalais", "Pâquis"] }],
      },
    ],
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    regionLabel: "Region / Planning Area",
    subcityLabel: "District / Neighborhood",
    defaultCenter: [1.3521, 103.8198],
    defaultZoom: 11,
    regions: [
      {
        name: "Central Region",
        cities: [{ name: "Singapore", center: [1.3521, 103.8198], subcities: ["Marina Bay / Downtown Core", "Orchard Road", "Tanjong Pagar", "Chinatown", "Bugis / Kampong Glam", "River Valley"] }],
      },
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    regionLabel: "State (Estado)",
    subcityLabel: "Municipality / Neighborhood (Colonia)",
    defaultCenter: [23.6345, -102.5528],
    defaultZoom: 5,
    regions: [
      {
        name: "Mexico City (CDMX)",
        cities: [{ name: "Mexico City", center: [19.4326, -99.1332], subcities: ["Polanco", "Roma Norte & Sur", "Condesa", "Centro Histórico", "Juárez (Zona Rosa)", "Coyoacán", "Santa Fe"] }],
      },
      {
        name: "Nuevo León",
        cities: [{ name: "Monterrey", center: [25.6866, -100.3161], subcities: ["San Pedro Garza García", "Centro", "Valle Oriente"] }],
      },
      {
        name: "Jalisco",
        cities: [{ name: "Guadalajara", center: [20.6597, -103.3496], subcities: ["Zapopan", "Americana", "Centro"] }],
      },
    ],
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    regionLabel: "Province",
    subcityLabel: "Neighborhood (Barrio)",
    defaultCenter: [-38.4161, -63.6167],
    defaultZoom: 4,
    regions: [
      {
        name: "Autonomous City of Buenos Aires (CABA)",
        cities: [{ name: "Buenos Aires", center: [-34.6037, -58.3816], subcities: ["Palermo (Soho & Hollywood)", "Recoleta", "San Telmo", "Puerto Madero", "Belgrano", "Microcentro"] }],
      },
    ],
  },
  {
    code: "RW",
    name: "Rwanda",
    flag: "🇷🇼",
    regionLabel: "Province",
    subcityLabel: "District / Sector",
    defaultCenter: [-1.9403, 29.8739],
    defaultZoom: 8,
    regions: [
      {
        name: "Kigali City",
        cities: [{ name: "Kigali", center: [-1.9441, 30.0619], subcities: ["Nyarugenge (CBD)", "Gasabo (Kacyiru / Nyarutarama / Kimihurura)", "Kicukiro (Gikondo / Kanombe)"] }],
      },
    ],
  },
  {
    code: "UG",
    name: "Uganda",
    flag: "🇺🇬",
    regionLabel: "Region / District",
    subcityLabel: "Division / Sub-county",
    defaultCenter: [1.3733, 32.2903],
    defaultZoom: 7,
    regions: [
      {
        name: "Central Region",
        cities: [{ name: "Kampala", center: [0.3476, 32.5825], subcities: ["Central Division (CBD)", "Nakawa (Naguru / Kololo / Bugolobi)", "Makindye", "Kawempe", "Rubaga"] }],
      },
    ],
  },
  {
    code: "TZ",
    name: "Tanzania",
    flag: "🇹🇿",
    regionLabel: "Region",
    subcityLabel: "District / Ward",
    defaultCenter: [-6.369, 34.8888],
    defaultZoom: 6,
    regions: [
      {
        name: "Dar es Salaam",
        cities: [{ name: "Dar es Salaam", center: [-6.7924, 39.2083], subcities: ["Kinondoni (Masaki / Oysterbay)", "Ilala (CBD)", "Temeke", "Kigamboni", "Ubungo"] }],
      },
      {
        name: "Arusha",
        cities: [{ name: "Arusha", center: [-3.3869, 36.683] }],
      },
      {
        name: "Zanzibar",
        cities: [{ name: "Stone Town / Zanzibar City", center: [-6.1659, 39.2026] }],
      },
    ],
  },
  {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    regionLabel: "Region",
    subcityLabel: "Municipal / Sub-metro",
    defaultCenter: [7.9465, -1.0232],
    defaultZoom: 6,
    regions: [
      {
        name: "Greater Accra Region",
        cities: [{ name: "Accra", center: [5.6037, -0.187], subcities: ["Airport Residential Area", "Osu", "East Legon", "Cantonments", "Labone", "Accra Central"] }],
      },
      {
        name: "Ashanti Region",
        cities: [{ name: "Kumasi", center: [6.6885, -1.6244] }],
      },
    ],
  },
  {
    code: "OTHER",
    name: "Other Country",
    flag: "🌐",
    regionLabel: "State / Province / Region",
    subcityLabel: "Sub-City / District / Area",
    defaultCenter: [20.0, 0.0],
    defaultZoom: 2,
    regions: [],
  },
];

import {
  COUNTRY_ADMIN_DIVISIONS,
  getCountryAdminConfig,
  CountryAdminDivision,
} from "./country-admin-divisions";
import { getCitiesForCountry } from "./countries-cities";

export function getCountryByCode(code: string): CountryConfig {
  const norm = (code || "").trim().toLowerCase();
  const found = WORLD_COUNTRIES.find(
    (c) => c.code.toLowerCase() === norm || c.name.toLowerCase() === norm
  );
  if (found) return found;
  return getCountryByName(code);
}

export function getCountryByName(name: string): CountryConfig {
  const norm = (name || "").trim().toLowerCase();
  const found = WORLD_COUNTRIES.find(
    (c) => c.name.toLowerCase() === norm || c.code.toLowerCase() === norm
  );
  const adminConfig: CountryAdminDivision = getCountryAdminConfig(name);

  if (found) {
    // Merge full ISO 3166-2 divisions if country has additional admin divisions
    const existingRegionNames = new Set(
      found.regions.map((r) => r.name.toLowerCase().replace(/[\s\-_/]/g, ""))
    );
    const additionalRegions = adminConfig.divisions
      .map((d) => {
        const dName = typeof d === "string" ? d : d.name;
        const dSubdivisions = typeof d === "string" ? [] : (d.subdivisions || []);
        return {
          name: dName,
          cities:
            dSubdivisions.length > 0
              ? [{ name: dName, subcities: dSubdivisions }]
              : [{ name: dName }],
        };
      })
      .filter((r) => !existingRegionNames.has(r.name.toLowerCase().replace(/[\s\-_/]/g, "")));

    return {
      ...found,
      regionLabel: adminConfig.adminLevel1Type || found.regionLabel,
      subcityLabel: adminConfig.subdivisionType || found.subcityLabel,
      regions: [...found.regions, ...additionalRegions],
    };
  }

  // Dynamic config for all other countries in the 195-country dataset
  return {
    code: adminConfig.code,
    name: adminConfig.country,
    flag: adminConfig.flag,
    regionLabel: adminConfig.adminLevel1Type || "Region / State / Province",
    subcityLabel: adminConfig.subdivisionType || "Sub-City / District / Area",
    defaultCenter: [20.0, 0.0],
    defaultZoom: 5,
    regions: adminConfig.divisions.map((d) => {
      const dName = typeof d === "string" ? d : d.name;
      const dSubdivisions = typeof d === "string" ? [] : (d.subdivisions || []);
      return {
        name: dName,
        cities:
          dSubdivisions.length > 0
            ? [{ name: dName, subcities: dSubdivisions }]
            : [{ name: dName }],
      };
    }),
  };
}

/**
 * Find the region/administrative division that contains a specific city in a given country.
 */
export function getRegionForCity(countryName: string, cityName: string, exact: boolean = false): string | undefined {
  if (!countryName || !cityName) return undefined;
  const config = getCountryByName(countryName);
  const normCity = cityName.trim().toLowerCase();
  const cleanCity = normCity.replace(/\s*\([^)]*\)/g, "").trim();

  // 1. Check in configured country regions' city lists
  for (const region of config.regions) {
    for (const city of region.cities) {
      const cName = city.name.toLowerCase();
      const cleanCName = cName.replace(/\s*\([^)]*\)/g, "").trim();
      if (
        cName === normCity ||
        cleanCName === cleanCity ||
        (cleanCity.length > 3 && cleanCName.includes(cleanCity)) ||
        (cleanCName.length > 3 && cleanCity.includes(cleanCName))
      ) {
        return region.name;
      }
    }
  }

  // 2. Check if the region name itself matches the city
  for (const region of config.regions) {
    const rName = region.name.toLowerCase();
    const cleanRName = rName.replace(/\s*\([^)]*\)/g, "").trim();
    if (
      rName === normCity ||
      cleanRName === cleanCity ||
      (cleanCity.length > 3 && cleanRName.includes(cleanCity)) ||
      (cleanRName.length > 3 && cleanCity.includes(cleanRName))
    ) {
      return region.name;
    }
  }

  // 3. Check COUNTRY_ADMIN_DIVISIONS
  const adminConfig = getCountryAdminConfig(countryName);
  for (const d of adminConfig.divisions) {
    const dName = typeof d === "string" ? d : d.name;
    const normD = dName.toLowerCase();
    const cleanD = normD.replace(/\s*\([^)]*\)/g, "").trim();
    if (
      normD === normCity ||
      cleanD === cleanCity ||
      (cleanCity.length > 3 && normD.includes(cleanCity)) ||
      (cleanD.length > 3 && cleanCity.includes(cleanD))
    ) {
      const matchedRegion = config.regions.find(
        (r) =>
          r.name.toLowerCase() === normD ||
          (cleanD.length > 3 && r.name.toLowerCase().includes(cleanD))
      );
      if (matchedRegion) return matchedRegion.name;
      return dName;
    }
    if (typeof d !== "string" && d.subdivisions) {
      // Don't match subcities if it's a chartered city
      const isChartered = d.type?.toLowerCase().includes("chartered city") || normD === "addis ababa" || normD === "dire dawa";
      if (!isChartered) {
        for (const sub of d.subdivisions) {
          const subLower = sub.toLowerCase();
          const cleanSub = subLower.replace(/\s*\([^)]*\)/g, "").trim();
          if (
            subLower === normCity ||
            cleanSub === cleanCity ||
            (cleanCity.length > 3 && (subLower.includes(cleanCity) || cleanCity.includes(cleanSub)))
          ) {
            const matchedRegion = config.regions.find(
              (r) => r.name.toLowerCase() === normD
            );
            if (matchedRegion) return matchedRegion.name;
            return dName;
          }
        }
      }
    }
  }

  return exact ? undefined : config.regions[0]?.name;
}

/**
 * Get map coordinates for a given city / region / country combination.
 */
export function getCityCoordinates(
  countryName: string,
  cityName?: string,
  regionName?: string
): [number, number] | undefined {
  if (!countryName) return undefined;
  const config = getCountryByName(countryName);

  if (cityName) {
    const normCity = cityName.trim().toLowerCase();
    const cleanCity = normCity.replace(/\s*\([^)]*\)/g, "").trim();

    // Search in specified region first
    if (regionName) {
      const reg = config.regions.find(
        (r) => r.name.toLowerCase() === regionName.toLowerCase()
      );
      if (reg) {
        for (const city of reg.cities) {
          const cName = city.name.toLowerCase();
          const cleanCName = cName.replace(/\s*\([^)]*\)/g, "").trim();
          if (
            (cName === normCity ||
              cleanCName === cleanCity ||
              (cleanCity.length > 3 && cName.includes(cleanCity))) &&
            city.center
          ) {
            return city.center;
          }
        }
      }
    }

    // Search across all regions in country
    for (const reg of config.regions) {
      for (const city of reg.cities) {
        const cName = city.name.toLowerCase();
        const cleanCName = cName.replace(/\s*\([^)]*\)/g, "").trim();
        if (
          (cName === normCity ||
            cleanCName === cleanCity ||
            (cleanCity.length > 3 && cName.includes(cleanCity))) &&
          city.center
        ) {
          return city.center;
        }
      }
    }
  }

  // Fallback to region center if available
  if (regionName) {
    const reg = config.regions.find(
      (r) => r.name.toLowerCase() === regionName.toLowerCase()
    );
    if (reg?.cities[0]?.center) return reg.cities[0].center;
  }

  return config.defaultCenter;
}

/**
 * Get all cities belonging to a given country and region/state.
 */
export function getCitiesForRegion(countryName: string, regionName: string): string[] {
  if (!countryName || !regionName) return [];
  const config = getCountryByName(countryName);
  const normReg = regionName.trim().toLowerCase();
  const cleanReg = normReg.replace(/\s*\([^)]*\)/g, "").trim();

  // Chartered city check: if region is a chartered city (e.g. Addis Ababa, Dire Dawa), its city is simply itself
  if (normReg === "addis ababa" || cleanReg === "addis ababa") {
    return ["Addis Ababa"];
  }
  if (normReg === "dire dawa" || cleanReg === "dire dawa") {
    return ["Dire Dawa"];
  }

  // 1. Check in config.regions
  const foundReg = config.regions.find((r) => {
    const rName = r.name.toLowerCase();
    const cleanRName = rName.replace(/\s*\([^)]*\)/g, "").trim();
    return (
      rName === normReg ||
      cleanRName === cleanReg ||
      (cleanReg.length > 3 && rName.includes(cleanReg)) ||
      (cleanRName.length > 3 && normReg.includes(cleanRName))
    );
  });

  const rawCities: string[] = [];

  if (foundReg && Array.isArray(foundReg.cities) && foundReg.cities.length > 0) {
    for (const c of foundReg.cities) {
      if (c.name) rawCities.push(c.name.trim());
    }
  }

  // 2. Also check cities in countries-cities.ts mapped specifically to this region
  try {
    const countryCities = getCitiesForCountry(countryName) || [];
    for (const c of countryCities) {
      const r = getRegionForCity(countryName, c, true);
      if (r) {
        const rLower = r.toLowerCase();
        const rClean = rLower.replace(/\s*\([^)]*\)/g, "").trim();
        if (
          rLower === normReg ||
          rClean === cleanReg ||
          (cleanReg.length > 3 && rLower.includes(cleanReg)) ||
          (rClean.length > 3 && normReg.includes(rClean))
        ) {
          rawCities.push(c.trim());
        }
      }
    }
  } catch {}

  // 3. Also check COUNTRY_ADMIN_DIVISIONS subdivisions (excluding zones and woreda administrative divisions)
  try {
    const adminConfig = getCountryAdminConfig(countryName);
    if (adminConfig && Array.isArray(adminConfig.divisions)) {
      for (const d of adminConfig.divisions) {
        const dName = typeof d === "string" ? d : d.name;
        const normD = dName.toLowerCase();
        const cleanD = normD.replace(/\s*\([^)]*\)/g, "").trim();
        const isChartered = typeof d !== "string" && (d.type?.toLowerCase().includes("chartered city") || normD === "addis ababa" || normD === "dire dawa");
        
        if (
          !isChartered &&
          (normD === normReg ||
            cleanD === cleanReg ||
            (cleanReg.length > 3 && normD.includes(cleanReg)) ||
            (cleanD.length > 3 && normReg.includes(cleanD)))
        ) {
          if (typeof d !== "string" && Array.isArray(d.subdivisions)) {
            for (const sub of d.subdivisions) {
              const cleanSub = sub.replace(/\s*\([^)]*\)/g, "").trim();
              if (
                !cleanSub.toLowerCase().includes("zone") &&
                !cleanSub.toLowerCase().includes("woreda") &&
                !cleanSub.toLowerCase().includes("special")
              ) {
                rawCities.push(cleanSub);
              }
            }
          }
        }
      }
    }
  } catch {}

  // Normalize, deduplicate, prefer clean base names
  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of rawCities) {
    if (!raw) continue;
    const base = raw.replace(/\s*\([^)]*\)/g, "").trim();
    const displayName = base.length > 0 ? base : raw.trim();
    const key = displayName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(displayName);
    }
  }

  if (result.length > 0) {
    return result;
  }

  // Fallback if region has no specific cities
  try {
    const countryCities = getCitiesForCountry(countryName) || [];
    if (countryCities.length > 0) return countryCities;
  } catch {}

  return [regionName];
}

const SUBCITY_COORDINATES: Record<string, [number, number]> = {
  // Addis Ababa Subcities & Districts
  "bole": [8.9954, 38.7891],
  "bole medhanialem": [8.9972, 38.7865],
  "bole atlas": [9.0068, 38.7818],
  "bole rwanda": [8.9882, 38.7824],
  "kirkos": [9.0117, 38.7578],
  "kazanchis": [9.0192, 38.7681],
  "kirkos (kazanchis)": [9.0192, 38.7681],
  "kazanchis (kirkos)": [9.0192, 38.7681],
  "sarbet": [8.9915, 38.7364],
  "sarbet (old airport)": [8.9915, 38.7364],
  "arada": [9.0345, 38.7512],
  "piassa": [9.0345, 38.7512],
  "arada (piassa)": [9.0345, 38.7512],
  "piassa (arada)": [9.0345, 38.7512],
  "mexico": [9.0105, 38.7447],
  "mexico square": [9.0105, 38.7447],
  "cmc": [9.0234, 38.8356],
  "cmc / ayat": [9.0234, 38.8356],
  "ayat": [9.0250, 38.8500],
  "gerji": [8.9892, 38.8095],
  "gerji / imperial": [8.9892, 38.8095],
  "imperial": [8.9892, 38.8095],
  "yeka": [9.0205, 38.7995],
  "megenagna": [9.0205, 38.7995],
  "yeka (megenagna)": [9.0205, 38.7995],
  "megenagna (yeka)": [9.0205, 38.7995],
  "22 mazoria": [9.0150, 38.7820],
  "lideta": [9.0083, 38.7333],
  "nifas silk-lafto": [8.9667, 38.7333],
  "kolfe keranio": [9.0167, 38.7000],
  "gullele": [9.0667, 38.7333],
  "akaky kaliti": [8.8833, 38.7667],
  "addis ketema": [9.0333, 38.7333],
  "lemi kura": [9.0167, 38.8500],
  "tor hailoch": [9.0090, 38.7240],
  "saris": [8.9500, 38.7600],
  "gotera": [8.9850, 38.7550],

  // Dire Dawa
  "sabian": [9.6050, 41.8550],
  "sabiyan": [9.6050, 41.8550],
  "kezira": [9.5980, 41.8620],
  "kazira": [9.5980, 41.8620],
  "megala": [9.5890, 41.8680],
  "gende kore": [9.5950, 41.8750],
  "melka jebdu": [9.5700, 41.8200],

  // Adama
  "boku shenen": [8.5450, 39.2720],
  "dembela": [8.5380, 39.2650],
  "lugo": [8.5500, 39.2600],
  "melka adama": [8.5300, 39.2800],

  // Hawassa
  "meneharia": [7.0580, 38.4820],
  "tabor": [7.0420, 38.4680],
  "hayk dar": [7.0500, 38.4550],
  "misrak": [7.0600, 38.4900],
  "mehal ketema": [7.0520, 38.4750],

  // Bahir Dar
  "gish abay": [11.5900, 37.3850],
  "belay zeleke": [11.6000, 37.3950],
  "fasilo": [11.5850, 37.3920],
  "tana": [11.6050, 37.3800],
  "shimbit": [11.5950, 37.4000],

  // Gondar
  "fasil ghebbi area": [12.6080, 37.4670],
  "maraki": [12.6150, 37.4580],
  "azezo": [12.5350, 37.4320],

  // Dessie
  "piazza": [11.1300, 39.6350],
  "robit": [11.1380, 39.6400],
  "hotie": [11.1250, 39.6300],

  // Mekelle
  "kedamay weyane": [13.4980, 39.4720],
  "hadnet": [13.4880, 39.4800],
  "ayder": [13.5050, 39.4600],
  "hawelti": [13.4920, 39.4650],

  // Harar
  "jugol (old walled city)": [9.3120, 42.1280],
  "aboker": [9.3180, 42.1200],
  "amir nur": [9.3100, 42.1150],

  // Nairobi
  "westlands": [-1.2683, 36.8044],
  "kilimani": [-1.2884, 36.7828],
  "karen": [-1.3197, 36.7065],
};

/**
 * Get map coordinates for a specific subcity/district or fallback to city coordinates.
 */
export function getSubcityCoordinates(
  countryName: string,
  cityName?: string,
  subcityName?: string
): [number, number] | undefined {
  if (!subcityName) return undefined;
  const normSub = subcityName.trim().toLowerCase();
  const cleanSub = normSub.replace(/\s*\([^)]*\)/g, "").trim();

  if (SUBCITY_COORDINATES[normSub]) return SUBCITY_COORDINATES[normSub];
  if (SUBCITY_COORDINATES[cleanSub]) return SUBCITY_COORDINATES[cleanSub];

  for (const [key, coords] of Object.entries(SUBCITY_COORDINATES)) {
    if (key === normSub || key === cleanSub || (cleanSub.length > 3 && key.includes(cleanSub))) {
      return coords;
    }
  }

  // Fallback to city coordinates if available
  if (countryName && cityName) {
    return getCityCoordinates(countryName, cityName);
  }

  return undefined;
}

