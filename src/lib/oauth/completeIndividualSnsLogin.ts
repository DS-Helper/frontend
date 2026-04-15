import type { NextRouter } from "next/router";
import { applyLoginResponseTokens, useUserStore } from "@/lib/store/userStore";
import { getMyIdentifier, parseMyIdentifierUserId } from "@/lib/apis/account";
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

  {
    const { setUser, setUserId, setUserType } = useUserStore.getState();
    if (data.user) setUser(data.user);
    setUserId(null);
    setUserType("individual");
  }

  try {
    const myIdentifierRes = await getMyIdentifier();
    const nextUserId = parseMyIdentifierUserId(myIdentifierRes?.data ?? null);
    if (nextUserId) useUserStore.getState().setUserId(nextUserId);
  } catch (error) {
    console.error("[auth] getMyIdentifier failed:", error);
  }

  await useUserStore.getState().checkAuthStatus({ force: true });
  await router.replace("/");
}
