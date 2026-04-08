import { instance } from "./axios";
import { AccountMyInfoResponse } from "@/types/account";

export const getMyInfo = async () => {
  try {
    const res = await instance.get<AccountMyInfoResponse>("/user/my-info");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};