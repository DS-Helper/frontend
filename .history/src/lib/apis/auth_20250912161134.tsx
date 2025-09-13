import { instance } from "./axios";

export const postlogin = async (data: any) => {
  try {
    const res = await instance.post("/personal-reservations", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};