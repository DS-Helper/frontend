import { instance } from "./axios";

export const getReservation = async () => {
  try {
    const res = await instance.post("/personal-reservations");
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createReservation = async (data: any) => {
  const response = await instance.post("/reservation", data);
  return response.data;
};