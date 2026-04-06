import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { waitForAuth } from "../services/auth";

export async function backfillAuthorId(): Promise<void> {
  const user = await waitForAuth();

  const sessionsQuery = query(collection(db, "sessions"), where("userId", "==", user.uid));
  const snapshot = await getDocs(sessionsQuery);

  const updates = snapshot.docs
    .filter(d => !d.data().authorId) // only old docs missing authorId
    .map(d => updateDoc(doc(db, "sessions", d.id), { authorId: user.uid }));

  if (updates.length === 0) {
    return;
  }

  await Promise.all(updates);
  console.log(`Migrated ${updates.length} session documents`);
}