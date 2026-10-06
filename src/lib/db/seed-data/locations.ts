import { LocationNode } from "@/types/location";

export const SEED_LOCATIONS: LocationNode[] = [
  // Countries
  { id: "loc-ethiopia", parentId: null, name: "Ethiopia", type: "country", latitude: 9.010793, longitude: 38.761252, countryCode: "ET" },
  { id: "loc-kenya", parentId: null, name: "Kenya", type: "country", latitude: -1.292066, longitude: 36.821946, countryCode: "KE" },

  // Ethiopia Regions & Cities
  { id: "loc-addis-ababa", parentId: "loc-ethiopia", name: "Addis Ababa", type: "city", latitude: 9.010793, longitude: 38.761252 },
  
  // Addis Ababa Sub-cities & Districts
  { id: "loc-bole", parentId: "loc-addis-ababa", name: "Bole", type: "subcity", latitude: 8.9954, longitude: 38.7891 },
  { id: "loc-bole-medhanialem", parentId: "loc-bole", name: "Bole Medhanialem", type: "district", latitude: 8.9972, longitude: 38.7865 },
  { id: "loc-bole-atlas", parentId: "loc-bole", name: "Bole Atlas", type: "district", latitude: 9.0068, longitude: 38.7818 },
  { id: "loc-bole-rwanda", parentId: "loc-bole", name: "Bole Rwanda", type: "district", latitude: 8.9882, longitude: 38.7824 },
  
  { id: "loc-kazanchis", parentId: "loc-addis-ababa", name: "Kazanchis (Kirkos)", type: "subcity", latitude: 9.0192, longitude: 38.7681 },
  { id: "loc-sarbet", parentId: "loc-addis-ababa", name: "Sarbet (Old Airport)", type: "subcity", latitude: 8.9915, longitude: 38.7364 },
  { id: "loc-piassa", parentId: "loc-addis-ababa", name: "Piassa (Arada)", type: "subcity", latitude: 9.0345, longitude: 38.7512 },
  { id: "loc-mexico", parentId: "loc-addis-ababa", name: "Mexico Square", type: "subcity", latitude: 9.0105, longitude: 38.7447 },
  { id: "loc-cmc", parentId: "loc-addis-ababa", name: "CMC / Ayat", type: "subcity", latitude: 9.0234, longitude: 38.8356 },
  { id: "loc-gerji", parentId: "loc-addis-ababa", name: "Gerji / Imperial", type: "subcity", latitude: 8.9892, longitude: 38.8095 },
  { id: "loc-megenagna", parentId: "loc-addis-ababa", name: "Megenagna (Yeka)", type: "subcity", latitude: 9.0205, longitude: 38.7995 },

  // Kenya Cities & Districts
  { id: "loc-nairobi", parentId: "loc-kenya", name: "Nairobi", type: "city", latitude: -1.2921, longitude: 36.8219 },
  { id: "loc-westlands", parentId: "loc-nairobi", name: "Westlands", type: "subcity", latitude: -1.2683, longitude: 36.8044 },
  { id: "loc-kilimani", parentId: "loc-nairobi", name: "Kilimani", type: "subcity", latitude: -1.2884, longitude: 36.7828 },
  { id: "loc-karen", parentId: "loc-nairobi", name: "Karen", type: "subcity", latitude: -1.3197, longitude: 36.7065 },
];
