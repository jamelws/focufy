import type { NextAuthConfig } from "next-auth";
import { loginSchema } from "./lib/zod";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./lib/db";

export default {
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<{
        id: string;
        name: string | null;
        email: string;
        role: string;
        image: string | null;
      } | null> => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        if (!user.password) return null;

        const isValid = await bcrypt.compare(password.trim(), user.password.trim());
        if (!isValid) return null;

        // 🔧 Convertir imagen a base64 si es Uint8Array
        let imageStr: string | null = null;
        if (user.image) {
          const buffer =
            user.image instanceof Uint8Array
              ? user.image
              : new Uint8Array(user.image as ArrayBufferLike);
          imageStr = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: imageStr,
        };
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",  // o "none" si usas subdominios cruzados
        path: "/",
        secure: true,     // 🔑 obliga HTTPS en producción
      },
    },
  },
} satisfies NextAuthConfig;
