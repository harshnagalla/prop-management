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
    "/rent-tracker/:path*",
    "/documents/:path*",
    "/map/:path*",
    "/tenants/:path*",
    "/compare/:path*",
    "/import/:path*",
  ],
};
