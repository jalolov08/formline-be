import mongoose, { Schema } from "mongoose";
import { MailStatus, UserType } from "../types/user.type";

const UserSchema = new Schema(
  {
    mail: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, required: true },
    linkedMails: [
      {
        mail: { type: String, required: true },
        status: {
          type: String,
          enum: Object.values(MailStatus),
          default: MailStatus.PENDING,
        },
      },
    ],
    verified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model<UserType>("User", UserSchema);
export default User;
