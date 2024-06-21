import mongoose, { Schema, Document } from "mongoose";
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

UserSchema.pre("save", async function (next) {
  const existingLinkedMail = this.linkedMails.find(
    (lm) => lm.mail === this.mail
  );

  if (!existingLinkedMail) {
    this.linkedMails.push({
      mail: this.mail,
      status: MailStatus.CONFIRMED,
    });
  }

  next();
});

const User = mongoose.model<UserType>("User", UserSchema);

export default User;
