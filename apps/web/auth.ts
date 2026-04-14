import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiUrl } from './lib/api';

export const { handlers } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const res = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.user) return { ...data.user, accessToken: data.token };
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: { signIn: '/login' }
});
