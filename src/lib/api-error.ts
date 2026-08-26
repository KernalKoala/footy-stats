/**
 * Standard error class for API fetch failures.
 * Includes status code and user-friendly message.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isRateLimit(): boolean {
    return this.statusCode === 429;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get userMessage(): string {
    if (this.isRateLimit) {
      return "Data requests are temporarily limited. Please wait a moment and try again.";
    }
    if (this.isUnauthorized) {
      return "Your session has expired. Please log in again.";
    }
    return this.message || "An unexpected error occurred. Please try again.";
  }
}

/**
 * Wrapper for fetch calls to API routes.
 * Throws ApiError with status code on non-OK responses.
 */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    let message = "Request failed";
    try {
      const json = await res.json();
      message = json.error || message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, res.status);
  }

  const json = await res.json();
  return json.data as T;
}
