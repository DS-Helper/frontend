import { instance } from "./axios";
import {
  AccountMyInfoData,
  AccountMyInfoResponse,
  GetMyIdentifierApiResponse,
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

/** `GET /user/my-identifier` 응답에서 userId 추출 (`{ userId }` / `{ data: { userId } }` 모두 대응) */
export function parseMyIdentifierUserId(body: unknown): string | null {
  if (body == null || typeof body !== "object" || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;
  const nested =
    root.data != null && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null;

  const raw = root.userId ?? root.user_id ?? nested?.userId ?? nested?.user_id;
  if (raw == null) return null;
  const normalized = String(raw).trim();
  return normalized.length > 0 ? normalized : null;
}

/** `GET /user/my-identifier` 응답에서 userRole 추출 (`{ userRole }` / `{ data: { userRole } }` 모두 대응) */
export function parseMyIdentifierUserRole(body: unknown): string | null {
  if (body == null || typeof body !== "object" || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;
  const nested =
    root.data != null && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null;

  const raw = root.userRole ?? root.user_role ?? nested?.userRole ?? nested?.user_role;
  if (raw == null) return null;
  const normalized = String(raw).trim();
  return normalized.length > 0 ? normalized : null;
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
    const normalizedDto = {
      ...dto,
      removeProfileImage: dto.removeProfileImage ?? false,
    };
    const formData = new FormData();
    formData.append(
      "dto",
      new Blob([JSON.stringify(normalizedDto)], { type: "application/json" })
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

export const getMyIdentifier = async () => {
  try {
    const res = await instance.get<GetMyIdentifierApiResponse>("/user/my-identifier");
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

export const deleteGoogle = async (accessToken: string) => {
  try {
    const res = await instance.delete("/user/oauth/google", {
      data: { accessToken },
    });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const deleteKakao = async (accessToken: string) => {
  try {
    const res = await instance.delete("/user/oauth/kakao", {
      data: { accessToken },
    });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const deleteNaver = async (accessToken: string) => {
  try {
    const res = await instance.delete("/user/oauth/naver", {
      data: { accessToken },
    });
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};