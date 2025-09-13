import { instance } from "./axios";

export const getReservation = async () => {
  try {
    const res = await instance.post("/personal-reservations");
    return res;
  } catch (e) {
    console.error(e);
  }
};

export const createReservation = async (data: any) => {
  const response = await instance.post("/reservation", data);
  return response.data;
};