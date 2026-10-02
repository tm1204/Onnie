import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthorised } from "@/lib/adminAuth";

export function proxy(request: NextRequest) {
  if (isAuthorised(request.headers.get("authorization"))) return NextResponse.next();
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Onnie admin"' },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
