export type UserType = {
  _id: string;
  mail: string;
  name: string;
  surname: string;
  password: string;
  linkedMails: LinkedMailType[];
  verified: boolean;
};
export type LinkedMailType = {
  mail: string;
  status: MailStatus;
};
export enum MailStatus {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  CONFIRMED = "CONFIRMED",
}
