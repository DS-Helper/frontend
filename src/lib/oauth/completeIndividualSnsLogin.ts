import type { NextRouter } from "next/router";
import { applyLoginResponseTokens, useUserStore } from "@/lib/store/userStore";
import type { User } from "@/types/userType";

type LoginResponseData = {
  accessToken?: string;
  refreshToken?: string;
  data?: { accessToken?: string; refreshToken?: string };
  token?: string;
  user?: User;
  message?: string;
};

export async function completeIndividualSnsLogin(
  router: NextRouter,
  responseData: unknown
): Promise<void> {
  if (responseData == null || typeof responseData !== "object") {
    throw new Error("로그인 요청에 실패했습니다.");
  }

  const data = responseData as LoginResponseData;
  const tokenState = applyLoginResponseTokens(data);

  const { accessToken, refreshToken } = useUserStore.getState();
  if (!accessToken && !refreshToken) {
    throw new Error(
      data.message || "응답에 accessToken·refreshToken이 없습니다."
    );
  }
  if (!tokenState.hasRefreshToken) {
    throw new Error(
      data.message || "로그인 응답에 refreshToken이 없어 인증 검증을 진행할 수 없습니다."
    );
  }

  if (data.user) {
    const { setUser, setUserType } = useUserStore.getState();
    setUser(data.user);
    setUserType("individual");
  }

  useUserStore.getState().setIsVerified(true);
  await router.replace("/");
}
