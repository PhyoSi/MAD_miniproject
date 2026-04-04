import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { waitForAuth } from "../services/auth";

export async function backfillAuthorId(): Promise<void> {
  const user = await waitForAuth();

  const snapshot = await getDocs(collection(db, "sessions"));

  const updates = snapshot.docs
    .filter(d => !d.data().authorId) // only old docs missing authorId
    .map(d => updateDoc(doc(db, "sessions", d.id), { authorId: user.uid }));

  await Promise.all(updates);
  console.log(`Migrated ${updates.length} documents`);
}