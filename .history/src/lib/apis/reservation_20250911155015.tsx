import { instance } from "./axios";

export const getReservation = async () => {
  const response = await instance.get("/reservation");
  return response.data;
};

export const createReservation = async (data: any) => {
  const response = await instance.post("/reservation", data);
  return response.data;
};