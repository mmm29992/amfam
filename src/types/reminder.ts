export interface Reminder {
  _id: string;
  title: string;
  message: string;
  scheduledTime: string;
  emailSubject?: string;
  emailBody?: string;
  targetEmail?: string;
  deleted?: boolean;
  category?: string; // ✅ made optional
  subcategory?: string; // ✅ made optional
  creatorId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string; // optional, but helps
  };
  updatedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string; // optional
  };
  createdAt?: string;
  updatedAt?: string;
}
