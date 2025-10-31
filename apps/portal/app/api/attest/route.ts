export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.text();
  const upstream = process.env.ATTEST_UPSTREAM ?? "https://kaizen-attest.onrender.com";
  const res = await fetch(`${upstream}/attest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" }
  });
}

