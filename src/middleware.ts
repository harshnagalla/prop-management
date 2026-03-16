import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/",
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties/:path*",
    "/bills/:path*",
    "/income/:path*",
    "/documents/:path*",
    "/import/:path*",
  ],
};
