import { UserCompleteLoginResponse } from "./types";

import { api } from "~/config";

class AuthService {
  async completeUserLogin(userEmail: string, magicLinkAuthToken: string) {
    const response = await api.post<UserCompleteLoginResponse>("/userlogin", { userEmail, magicLinkAuthToken });

    return response.data;
  }
}

export const authService = Object.freeze(new AuthService());
