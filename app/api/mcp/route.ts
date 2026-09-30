import { handleRpc } from "@/lib/mcp";
import { SITE_URL } from "@/lib/site";

export const runtime = "edge";

const APP = {
  name: "Invoice Generator",
  description: "Build and review a local THB invoice draft in the browser.",
  url: SITE_URL,
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }
  const response = handleRpc(body, APP);
  if (response === null) return new Response(null, { status: 202 });
  return Response.json(response);
}
