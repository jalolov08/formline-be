export type FormType = {
  _id: string;
  name: string;
  owner: string;
  targetMail: string;
  enabled: boolean;
  emailNotifications: boolean;
  trackId: string;
  fields: string[];
};
