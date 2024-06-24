import mongoose, { Schema } from "mongoose";
import { ApplicationType } from "../types/application.type";

const ApplicationSchema: Schema = new Schema(
  {
    formTrackId: { type: String, required: true },
    fields: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Application = mongoose.model<ApplicationType>(
  "Application",
  ApplicationSchema
);

export default Application;
