import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";

export default NextAuth({
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn(params) {
      const { user, account, profile, email, credentials } = params;

      console.log("signin:", String(params));

      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect:", String(baseUrl));
      return baseUrl;
    },
    async session({ session, user, token }) {
      console.log("session:", String(session));
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("jwt:", String(token));
      return token;
    },
  },
  events: {
    signIn: async (params) => {
      console.log("signIn:", String(params));
    },
    createUser: async (params) => {
      console.log("createUser:", String(params));
    },
    updateUser: async (params) => {
      console.log("updateUser:", String(params));
    },
    linkAccount: async (params) => {
      console.log("linkAccount:", String(params));
    },
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "username@mail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Check if the user exists in the database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials?.email,
          },
        });
        if (!user || !credentials) {
          // If the user does not exist, throw an error
          throw new Error("User not found");
        }

        // Check if the password is correct
        const isValid = true;

        // const isValid = await user.checkPassword(credentials.password);
        if (!isValid) {
          // If the password is incorrect, throw an error
          throw new Error("Invalid password");
        }
        // Return the user object

        console.log("authorize:", String(user));
        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
  ],
});
