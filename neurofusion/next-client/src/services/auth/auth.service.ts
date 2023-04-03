import { api } from "~/config";

import { UserCompleteLoginResponse } from "./types";

class AuthService {
  async completeUserLogin(userEmail: string, magicLinkAuthToken: string) {
    const response = await api.post<UserCompleteLoginResponse>("/userlogin", { userEmail, magicLinkAuthToken });

    return response.data;
  }
}

export const authService = Object.freeze(new AuthService());
