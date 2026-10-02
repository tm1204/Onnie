import { randomUUID } from "node:crypto";

// Uploads go through the server with the service key; the key never reaches the browser.
// Bucket "audio" must exist and be public-read.
const BUCKET = "audio";

export async function uploadAudio(file: File): Promise<string> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("Storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  if (!file.type.startsWith("audio/")) throw new Error("File must be audio.");

  const ext = (file.name.split(".").pop() ?? "mp3").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${randomUUID()}.${ext || "mp3"}`;
  const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": file.type },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!res.ok) throw new Error(`Audio upload failed (${res.status}).`);
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}
