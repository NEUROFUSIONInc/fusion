import { DefaultSession, DefaultUser } from "next-auth";

import { UserCompleteLoginResponse } from "~/services/auth/types";

type IUser = DefaultUser & UserCompleteLoginResponse["body"];

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
