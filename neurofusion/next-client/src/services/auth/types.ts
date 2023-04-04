export interface UserCompleteLoginResponse {
  body: {
    userGuid: string;
    magicLinkAuthToken: string;
    magicflowToken: string;
    neurosityToken: string;
    authToken: string;
  };
}

export type UserCompleteBody = UserCompleteLoginResponse["body"];
