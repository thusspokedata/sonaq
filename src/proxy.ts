import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Admin ya autenticado visitando la página de login → redirigir al panel
  if (isLoginPage && isAdmin) {
    return NextResponse.redirect(new URL("/admin/pedidos", req.url));
  }

  if (!isLoginPage) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
