import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Account } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleAuthEnabled = Boolean(googleClientId && googleClientSecret);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapOAuthAccount(account: Account) {
  return {
    type: account.type,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token,
    access_token: account.access_token,
    expires_at: account.expires_at,
    token_type: account.token_type,
    scope: account.scope,
    id_token: account.id_token,
    session_state: account.session_state,
  };
}

function isUnverifiedGoogleProfile(profile: unknown) {
  return (
    typeof profile === "object" &&
    profile !== null &&
    "email_verified" in profile &&
    (profile as { email_verified?: boolean }).email_verified === false
  );
}

async function findOrCreateOAuthUser({
  email,
  name,
  image,
  account,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
  account: Account;
}) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: existingUser.name ?? name ?? undefined,
          image: existingUser.image ?? image ?? undefined,
        },
      })
    : await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name ?? undefined,
          image: image ?? undefined,
        },
      });

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    update: {
      userId: user.id,
      ...mapOAuthAccount(account),
    },
    create: {
      userId: user.id,
      ...mapOAuthAccount(account),
    },
  });

  return user;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = normalizeEmail(credentials.email);
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    ...(googleAuthEnabled
      ? [
          GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (!user.email || !account.providerAccountId) return false;

      if (isUnverifiedGoogleProfile(profile)) return false;

      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const email = user?.email ?? token.email;
        if (!email || !account.providerAccountId) return token;

        const dbUser = await findOrCreateOAuthUser({
          email,
          name: user?.name ?? token.name,
          image: user?.image ?? token.picture,
          account,
        });

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.picture = dbUser.image;
        return token;
      }

      if (user) token.id = user.id;
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizeEmail(token.email) },
        });
        if (dbUser) token.id = dbUser.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
