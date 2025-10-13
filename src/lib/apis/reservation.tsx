import { instance } from "./axios";

// 개인 사용자 예약
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
    const res = await instance.get("/personal-reservations", params);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// 조직 사용자 예약
export const postOrganizationReservation = async (data: any) => {
  try {
    const res = await instance.post("/organization-reservations", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// 사용자 타입에 따라 적절한 API 호출
export const postReservation = async (data: any, userType?: string) => {
  console.log('예약 요청 - 사용자 타입:', userType);
  
  if (userType === 'organization') {
    console.log('조직 사용자 예약 API 호출');
    return await postOrganizationReservation(data);
  } else {
    console.log('개인 사용자 예약 API 호출');
    return await postPersonalReservation(data);
  }
};