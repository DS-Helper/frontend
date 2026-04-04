import { instance } from "../apis/axios";
import { resetUserSession } from "../store/userStore";

export const handleLogout = async () => {
  try {
    const response = await instance.post("/logout");
    resetUserSession();
    return response;
  } catch (error) {
    console.error("로그아웃 중 오류:", error);
    resetUserSession();
    throw error;
  }
};

