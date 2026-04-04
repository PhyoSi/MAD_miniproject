import { serverTimestamp } from "firebase/firestore";

export interface Post {
  title: string;
  authorId: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}