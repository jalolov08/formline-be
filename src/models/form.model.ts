import mongoose, { Schema, Document } from "mongoose";
import { FormType } from "../types/form.type";

const FormSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    targetMail: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    trackId: { type: String, unique: true },
    fields: { type: [String], required: false },
  },
  { timestamps: true }
);

FormSchema.pre("save", async function (next) {
  const possibleChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let trackId = "";
  while (trackId.length < 8) {
    trackId += possibleChars.charAt(
      Math.floor(Math.random() * possibleChars.length)
    );
  }

  this.trackId = trackId;
  next();
});

const Form = mongoose.model<FormType>("Form", FormSchema);

export default Form;
