export type Email = {
  id: string;
  from: string;
  subject: string;
  date: Date;
  body?: string;
  priority?: 'high' | 'medium' | 'normal';
};
