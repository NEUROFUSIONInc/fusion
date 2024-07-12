import { DefaultSession, DefaultUser } from "next-auth";

type IUser = DefaultUser & {
  authToken: string;
  privateKey?: string;
};

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    authToken: string;
  }
}

declare module "next-auth" {
  interface User extends IUser {}
  interface Session extends DefaultSession {
    user?: User;
  }
}
