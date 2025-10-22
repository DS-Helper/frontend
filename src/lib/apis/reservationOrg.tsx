import { instance } from "./axios";

export const postOrganizationReservation = async (data: any) => {
  try {
    const res = await instance.post("/organization-reservations", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getOrganizationReservation = async (params: any) => {
  try {
    const res = await instance.get("/organization-reservations/status", params);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getOrganizationReservationDetail = async (organizationReservationId: string) => {
  try {
    const res = await instance.get(`/organization-reservations/${organizationReservationId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const patchOrganizationReservation = async (organizationReservationId: string) => {
  try {
    const res = await instance.patch(`/organization-reservations`, {
      organizationReservationId: organizationReservationId
    });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};
