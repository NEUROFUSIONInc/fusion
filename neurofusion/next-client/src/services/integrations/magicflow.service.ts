import { api } from "~/config";

class MagicflowService {
  async getMagicFlowToken(authToken?: string) {
    const response = await api.get<{ magicflowToken: string }>("/magicflow/get-token", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  }

  async setMagicFlowToken(magicflowToken: string) {
    const response = await api.post<{ magicflowToken: string }>("/magicflow/set-token", { magicflowToken });
    return response.data;
  }
}

export const magicflowService = Object.freeze(new MagicflowService());
