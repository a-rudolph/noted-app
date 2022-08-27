// import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }) {
      const userWithId = {
        ...session.user,
        id: user.id,
      };

      return {
        ...session,
        user: userWithId,
      };
    },
  },
  providers: [
    // CredentialsProvider({
    //   name: "Email",
    //   credentials: {
    //     email: {
    //       label: "Email",
    //       type: "text",
    //       placeholder: "username@mail.com",
    //     },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     // Check if the user exists in the database
    //     const user = await prisma.user.findFirst({
    //       where: {
    //         email: credentials?.email,
    //       },
    //     });
    //     if (!user || !credentials) {
    //       // If the user does not exist, throw an error
    //       throw new Error("User not found");
    //     }

    //     // Check if the password is correct
    //     const isValid = true;

    //     // const isValid = await user.checkPassword(credentials.password);
    //     if (!isValid) {
    //       // If the password is incorrect, throw an error
    //       throw new Error("Invalid password");
    //     }
    //     // Return the user object

    //     console.log("authorize:", String(user));
    //     return user;
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
});
