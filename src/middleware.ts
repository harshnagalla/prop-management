import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/landing",
});

export const config = {
  matcher: [
    "/((?!api/auth|auth|landing|_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png).*)",
  ],
};
