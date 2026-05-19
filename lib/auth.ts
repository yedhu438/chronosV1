// Shared auth options for NextAuth v4
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validUser = process.env.ADMIN_USERNAME || 'admin';
        const validPass = process.env.ADMIN_PASSWORD || 'admin123';
        if (credentials?.username === validUser && credentials?.password === validPass) {
          return { id: '1', name: 'Admin', email: 'admin@fullymerched.com' };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin' },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};
