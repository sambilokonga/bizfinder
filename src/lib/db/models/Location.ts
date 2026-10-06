import mongoose, { Schema, Document } from "mongoose";

export interface ILocationDoc extends Document {
  id: string;
  parentId?: string | null;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
}

const LocationSchema = new Schema<ILocationDoc>(
  {
    id: { type: String, required: true, unique: true },
    parentId: { type: String, default: null, index: true },
    name: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["country", "region", "zone", "woreda", "city", "subcity", "district"],
      required: true,
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    countryCode: { type: String },
  },
  { timestamps: true }
);

export const LocationModel =
  mongoose.models.Location || mongoose.model<ILocationDoc>("Location", LocationSchema);
