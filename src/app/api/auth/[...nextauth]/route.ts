import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  // Use Prisma adapter for database (disabled for credentials since adapter doesn't support it)
  adapter: PrismaAdapter(prisma),

  // Required for production
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Specify session strategy (JWT required for credentials provider)
  session: {
    strategy: "jwt",
  },

  // Configure pages
  pages: {
    signIn: "/login",
  },

  providers: [
    // 🔹 Google login (will use Prisma adapter)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔹 Email-password login (uses manual database lookup)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Authorization attempt started");

        if (!credentials || !credentials.email || !credentials.password) {
          console.warn("❌ Missing credentials");
          return null;
        }

        console.log("📧 Email provided:", credentials.email);

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.warn("❌ User not found:", credentials.email);
          return null;
        }

        // Check if user has a password (for credentials login)
        if (!user.password) {
          console.warn("❌ User has no password (OAuth only):", credentials.email);
          return null;
        }

        console.log("✅ User found:", user.email);

        try {
          console.log("🔒 Comparing password...");
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.warn("❌ Invalid password for:", credentials.email);
            return null;
          }

          console.log("✅ Password valid! Login successful");
        } catch (err) {
          console.error("❌ Error comparing password:", err);
          return null;
        }

        // return a safe user object (do not include password)
        console.log("✅ Returning user object");
        return {
          id: user.id,
          name: user.name,
          email: user.email!,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }
      // Store the OAuth provider if using Google
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id and provider to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
