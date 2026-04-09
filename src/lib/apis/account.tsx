import { instance } from "./axios";
import {
  AccountMyInfoData,
  AccountMyInfoResponse,
  GetScrapsApiResponse,
  PatchMyInfoRequest,
  PatchMyInfoResponse,
} from "@/types/account";

/** axios `response.data`(표준 `{ success, data }` 또는 평면 사용자 객체)에서 `AccountMyInfoData` 정규화 */
export function parseAccountMyInfoResponse(body: unknown): AccountMyInfoData | null {
  if (body == null || typeof body !== "object" || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;
  const inner =
    root.data != null && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  return {
    name: String(inner.name ?? ""),
    email:
      inner.email === null || inner.email === undefined
        ? null
        : String(inner.email),
    birthyear: String(inner.birthyear ?? ""),
    gender: String(inner.gender ?? ""),
    phoneNumber: String(inner.phoneNumber ?? ""),
    profileImageUrl: String(inner.profileImageUrl ?? ""),
  };
}

export const getMyInfo = async () => {
  try {
    const res = await instance.get<AccountMyInfoResponse>("/user/my-info");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};


export const patchMyInfo = async ({ dto, profileImage }: PatchMyInfoRequest) => {
  try {
    const formData = new FormData();
    formData.append(
      "dto",
      new Blob([JSON.stringify(dto)], { type: "application/json" })
    );
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }
    const res = await instance.patch<PatchMyInfoResponse>("/user/my-info", formData);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getScraps = async () => {
  try {
    const res = await instance.get<GetScrapsApiResponse>("/boards/scrap");
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};