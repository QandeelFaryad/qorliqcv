export async function generateCvAi({ type, cv }) {
  const res = await fetch("/api/ai/cv-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, cv }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || "Failed to generate AI content.");
  }
  return data.html;
}
