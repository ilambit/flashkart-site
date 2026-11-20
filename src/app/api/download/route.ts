import { NextRequest, NextResponse } from "next/server";

// Apex of the configured API host; attachments always live under it.
const apexOf = (host: string) => host.split(".").slice(-2).join(".");

const allowedApex = () => {
  try {
    return apexOf(new URL(process.env.NEXT_PUBLIC_API_URL || "").hostname);
  } catch {
    return "";
  }
};

// Streams a remote attachment from the same origin so the browser can save it
// without opening (and instantly closing) a tab.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  const name = req.nextUrl.searchParams.get("n") || "document";
  if (!raw) return new NextResponse("missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }
  const apex = allowedApex();
  if (!apex || apexOf(target.hostname) !== apex) {
    return new NextResponse("host not allowed", { status: 403 });
  }

  const upstream = await fetch(target.toString());
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("upstream error", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
