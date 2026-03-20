import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/utils/prisma";
import bcrypt from "bcryptjs";

function mapImageToAvatarUrl<T extends Record<string, unknown>>(data: T) {
  const { image, ...rest } = data as { image?: unknown } & Record<string, unknown>;
  return image !== undefined ? { ...rest, avatarUrl: image } : rest;
}

const baseAdapter = PrismaAdapter(prisma);
const adapter = {
  ...baseAdapter,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: (data: any) => baseAdapter.createUser!(mapImageToAvatarUrl(data) as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUser: (data: any) => baseAdapter.updateUser!(mapImageToAvatarUrl(data) as any),
};

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.hashedPassword);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // When signing in with Google, store the googleId
      if (account?.provider === "google" && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId: account.providerAccountId },
        }).catch(() => {
          // User might not exist yet (first Google sign-in), adapter will create them
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.avatarUrl) {
        session.user.image = token.avatarUrl as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.avatarUrl = user.image;
      }
      // Allow session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.avatarUrl = session.avatarUrl;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
