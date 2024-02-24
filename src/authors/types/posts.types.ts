export interface IPost {
  _id: string;
  created_at: Date;
  last_update: Date;
  title: string;
  body: string;
  author?: string;
}
