export interface Reminder {
  _id: string;
  title: string;
  message: string;
  scheduledTime: string;
  emailSubject?: string;
  emailBody?: string;
  targetEmail?: string;
  deleted?: boolean;
  category: string;
  subcategory: string;
  creatorId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  updatedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
