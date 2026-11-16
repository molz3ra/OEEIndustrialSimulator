export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

export async function apiRequest<T = any>(
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
  url: string,
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  let data: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Erro HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, errorMsg, data?.details);
  }

  return data as T;
}
