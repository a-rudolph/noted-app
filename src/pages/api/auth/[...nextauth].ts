import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

console.log("GOOGLE_CLIENT_ID", GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET", GOOGLE_CLIENT_SECRET);

export default NextAuth({
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
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
