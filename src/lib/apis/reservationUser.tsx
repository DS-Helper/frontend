import { instance } from "./axios";

export const postPersonalReservation = async (data: any) => {
  try {
    const res = await instance.post("/personal-reservations", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getPersonalReservation = async (params: any) => {
  try {
    const res = await instance.get("/personal-reservations/status", params);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getPersonalReservationDetail = async (personalReservationId: string) => {
  try {
    const res = await instance.get(`/personal-reservations/${personalReservationId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const patchPersonalReservation = async (personalReservationId: string) => {
  try {
    const res = await instance.patch(`/personal-reservations`, {
      personalReservationId: personalReservationId
    });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getReservationReserved = async (date: string) => {
  try {
    const res = await instance.get(`/reservations/pre-reserved`, { params: { date } });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};