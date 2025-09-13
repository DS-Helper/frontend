import { instance } from "./axios";

export const getReservation = async () => {
  try
};

export const createReservation = async (data: any) => {
  const response = await instance.post("/reservation", data);
  return response.data;
};