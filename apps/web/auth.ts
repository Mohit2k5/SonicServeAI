import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiUrl } from "./lib/api";

type SonicServeUser = {
  accessToken?: string;
  api_key?: string;
  id?: string;
  plan?: string;
};

console.log("🔐 Auth.js configuration initializing...");
console.log(
  "AUTH_SECRET exists:",
  !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(apiUrl("/api/auth/login"), {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.user) return { ...data.user, accessToken: data.token };
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          const sonicUser = user as SonicServeUser;
          token.accessToken = sonicUser.accessToken;
          token.api_key = sonicUser.api_key;
          token.id = sonicUser.id;
          token.plan = sonicUser.plan;
        }
        return token;
      } catch (err) {
        console.error("❌ JWT Callback Error:", err);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        session.accessToken =
          typeof token.accessToken === "string" ? token.accessToken : undefined;
        if (session.user) {
          if (typeof token.api_key === "string") {
            session.user.api_key = token.api_key;
          }
          if (typeof token.id === "string") {
            session.user.id = token.id;
          }
          if (typeof token.plan === "string") {
            session.user.plan = token.plan;
          }
        }
        return session;
      } catch (err) {
        console.error("❌ Session Callback Error:", err);
        return session;
      }
    },
  },
  pages: { signIn: "/login" },
});
