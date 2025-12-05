import Cookies from "js-cookie";

export function setAuthToken(token: string) {
  Cookies.set("token", token, {
    expires: 7, // 7 hari
    secure: false,
    sameSite: "lax",
    path: "/",
  });
}

export function clearAuthToken() {
  Cookies.remove("token");
}
