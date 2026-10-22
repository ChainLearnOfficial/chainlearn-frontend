const MAX_REPORT_SIZE = 64 * 1024;

export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > MAX_REPORT_SIZE) {
    return new Response(null, { status: 413 });
  }

  try {
    const report: unknown = JSON.parse(body);
    if (report === null || typeof report !== "object") {
      return new Response(null, { status: 400 });
    }
    console.warn("[CSP violation report]", report);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}