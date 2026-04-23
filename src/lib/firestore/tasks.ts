import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { addActivity } from "@/lib/firestore/activities";
import type { Task, TaskFormData } from "@/types/tasks";

const TASKS = "tasks";

function dueToPatch(data: Partial<TaskFormData>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.notes !== undefined) patch.notes = data.notes;
  if (data.dueAt !== undefined)
    patch.dueAt = data.dueAt ? Timestamp.fromDate(data.dueAt) : null;
  if (data.contactId !== undefined) patch.contactId = data.contactId;
  if (data.dealId !== undefined) patch.dealId = data.dealId;
  if (data.eventId !== undefined) patch.eventId = data.eventId;
  return patch;
}

export function subscribeToTasks(
  ownerId: string,
  callback: (tasks: Task[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), TASKS),
    where("ownerId", "==", ownerId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) }),
      );
      tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const da = toMillis(a.dueAt);
        const db = toMillis(b.dueAt);
        if (!da && !db) return toMillis(b.createdAt) - toMillis(a.createdAt);
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      });
      callback(tasks);
    },
    (err) => onError?.(err),
  );
}

export function subscribeToTasksForContact(
  contactId: string,
  ownerId: string,
  callback: (tasks: Task[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), TASKS),
    where("ownerId", "==", ownerId),
    where("contactId", "==", contactId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) }),
      );
      tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return toMillis(a.dueAt) - toMillis(b.dueAt);
      });
      callback(tasks);
    },
    (err) => onError?.(err),
  );
}

export async function createTask(
  ownerId: string,
  data: TaskFormData,
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), TASKS), {
    title: data.title,
    notes: data.notes,
    dueAt: data.dueAt ? Timestamp.fromDate(data.dueAt) : null,
    completed: false,
    completedAt: null,
    contactId: data.contactId,
    dealId: data.dealId,
    eventId: data.eventId,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTask(
  id: string,
  data: Partial<TaskFormData>,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), TASKS, id), {
    ...dueToPatch(data),
    updatedAt: serverTimestamp(),
  });
}

export async function setTaskCompleted(
  task: Task,
  completed: boolean,
  userId: string,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), TASKS, task.id), {
    completed,
    completedAt: completed ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
  if (completed && task.contactId) {
    await addActivity(task.contactId, {
      type: "task_completed",
      createdBy: userId,
      content: `Task completed: "${task.title}"`,
      meta: {},
    });
  }
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), TASKS, id));
}

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  const maybe = v as { toDate?: () => Date; seconds?: number };
  if (typeof maybe.toDate === "function") return maybe.toDate().getTime();
  if (typeof maybe.seconds === "number") return maybe.seconds * 1000;
  return 0;
}
