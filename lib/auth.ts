import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Demo account credentials
const DEMO_EMAIL = "demo@hostelhive.com";
const DEMO_PASSWORD = "demo123456";

// Create demo account if it doesn't exist
async function createDemoAccount() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (!existingUser) {
      console.log("Creating demo account...");
      const demoUser = await prisma.user.create({
        data: {
          email: DEMO_EMAIL,
          name: "Demo User",
          password: hashedPassword,
        },
      });

      // Create a default wallet for demo user
      await prisma.wallet.create({
        data: {
          name: "Demo Wallet",
          type: "cash",
          balance: 1000,
          userId: demoUser.id,
        },
      });

      // Create some default categories
      const categories = [
        { name: "Food", type: "EXPENSE" },
        { name: "Transport", type: "EXPENSE" },
        { name: "Entertainment", type: "EXPENSE" },
        { name: "Education", type: "EXPENSE" },
        { name: "Salary", type: "INCOME" },
        { name: "Allowance", type: "INCOME" },
      ];

      for (const category of categories) {
        await prisma.category.create({
          data: category,
        });
      }

      console.log("Demo account created successfully");
    }
  } catch (error) {
    console.error("Failed to create demo account:", error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  debug: false, // Set to false in production
};

// Initialize demo account
createDemoAccount().catch(console.error);

export default authOptions;