type ApiResponse<T = any> = { data: T };
async function request<T = any>(method: string, url: string, body?: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || "The request could not be completed.") as Error & { response?: { status: number; data: unknown } };
    error.response = { status: response.status, data };
    throw error;
  }
  return { data };
}
export const api = {
  get: <T = any>(url: string) => request<T>("GET", url),
  post: <T = any>(url: string, body?: unknown) => request<T>("POST", url, body),
  put: <T = any>(url: string, body?: unknown) => request<T>("PUT", url, body),
  delete: <T = any>(url: string) => request<T>("DELETE", url),
  upload: async <T = any>(url: string, form: FormData): Promise<ApiResponse<T>> => {
    const response = await fetch(url, { method: "POST", credentials: "same-origin", body: form, headers: { Accept: "application/json" } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || "The upload could not be completed.") as Error & { response?: { status: number; data: unknown } };
      error.response = { status: response.status, data };
      throw error;
    }
    return { data };
  }
};
