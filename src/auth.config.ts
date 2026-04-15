import type { NextAuthConfig } from "next-auth";

// Config Edge-compatible: sin Prisma, sin bcrypt, sin pg.
// Solo se usa en el middleware.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};
