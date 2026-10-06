export type LocationType =
  | "country"
  | "region"
  | "zone"
  | "woreda"
  | "city"
  | "subcity"
  | "district";

export interface LocationNode {
  id: string;
  parentId?: string | null;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  countryCode?: string;
  businessCount?: number;
}

export interface LocationTree extends LocationNode {
  children?: LocationTree[];
}
