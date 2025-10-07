import {DefaultSession} from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?:string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role?:string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string; 
    role?:string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}