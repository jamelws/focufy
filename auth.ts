// auth.ts
import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Tu provider/validaciones viven en auth.config.ts
  ...authConfig,

  session: { strategy: "jwt" },

  // Necesario detrás de proxy/CDN o dominio custom
  trustHost: true,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user viene del authorize() de tu Credentials
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Asegura que session.user exista y copia campos del token
      (session as any).user = (session as any).user ?? {};
      (session as any).user.id = (token as any).id;
      (session as any).user.role = (token as any).role;
      (session as any).user.name = token.name as any;
      (session as any).user.email = token.email as any;
      (session as any).user.image = token.image as any;
      return session;
    },
  },
});
