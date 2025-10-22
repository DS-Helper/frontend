import { instance } from "./axios";

export const getInquiries = async () => {
  try {
    const res = await instance.get("/inquires/all");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postInquiry = async (data: any) => {
  try {
    const res = await instance.post("/inquires", data);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getInquiryById = async (inquiryId: string) => {
  try {
    const res = await instance.get(`/inquires/${inquiryId}`);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};
