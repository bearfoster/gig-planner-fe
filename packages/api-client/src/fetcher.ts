import type { ProblemDetails } from "./generated/models";

export class ApiError extends Error {
  status: number;
  problem: ProblemDetails;
  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  const runtime = globalThis as typeof globalThis & {
    __SYDNEY_GIG_API_BASE_URL__?: string;
  };
  const baseUrl = runtime.__SYDNEY_GIG_API_BASE_URL__ ?? "";
  const mockRole =
    typeof localStorage === "undefined"
      ? "user"
      : (localStorage.getItem("sgp-mock-role") ?? "user");
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Mock-Role": mockRole,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const fallback: ProblemDetails = {
      type: "about:blank",
      title: response.statusText || "Request failed",
      status: response.status,
      detail: "The request could not be completed.",
    };
    const problem = (await response
      .json()
      .catch(() => fallback)) as ProblemDetails;
    throw new ApiError(response.status, problem);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
