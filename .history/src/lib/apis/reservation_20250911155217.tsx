import { instance } from "./axios";

export const getReservation = async (data: any) => {
  try {
    const res = await instance.post("/personal-reservations");
    return res;
  } catch (e) {
    console.error(e);
  }
};