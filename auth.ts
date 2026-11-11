import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/features/fudo-account/server/db";
import { checkPassword, clearRateLimit, isRateLimited, rateKey } from "@/features/fudo-account/server/security";
import { loginSchema } from "@/features/fudo-account/server/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 14 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Пароль", type: "password" } },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const key = rateKey("signin", email);
        if (await isRateLimited(key, 8, 15 * 60_000)) return null;
        const user = await db.fudoUser.findUnique({ where: { email } });
        if (!user || !(await checkPassword(password, user.passwordHash))) return null;
        await clearRateLimit(key);
        return { id: user.id, name: user.name, email: user.email, tokenVersion: user.tokenVersion };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.userId = user.id; token.tokenVersion = user.tokenVersion; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.tokenVersion = token.tokenVersion ?? -1;
      }
      return session;
    },
  },
});
