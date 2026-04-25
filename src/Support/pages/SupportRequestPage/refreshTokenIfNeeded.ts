import { apiService } from "../../../services/apiClass";

export async function refreshTokenIfNeeded() {
  try {
    await apiService.post("/auth/refresh", '', { "Content-Type": "text/plain; charset=utf-8" });
  } catch (e) {
    // ignore, fallback to login
  }
}
