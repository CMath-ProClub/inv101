import { auth } from "@clerk/nextjs/server";
import { getMockApiResponse } from "./api-mocks";

const DEFAULT_API_BASE = "http://localhost:4000";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || DEFAULT_API_BASE;
}

type FetchApiOptions = {
  revalidateSeconds?: number;
  init?: RequestInit;
};

type ResolvedFetchOptions = {
  revalidateSeconds: number;
  init?: RequestInit;
};

type FetchAuthedOptions = FetchApiOptions & {
  requireAuth?: boolean;
};

function resolveFetchOptions(options?: number | FetchApiOptions): ResolvedFetchOptions {
  if (typeof options === "number") {
    return { revalidateSeconds: options, init: undefined };
  }

  return {
    revalidateSeconds: options?.revalidateSeconds ?? 120,
    init: options?.init,
  };
}

export async function fetchApi<T>(path: string, options?: number | FetchApiOptions): Promise<T | null> {
  const { revalidateSeconds, init } = resolveFetchOptions(options);
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  try {
    const headers = new Headers(init?.headers as HeadersInit | undefined);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    const baseInit = init ? { ...init } : {};

    const response = await fetch(url, {
      ...baseInit,
      headers,
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
      console.warn(`API request failed (${response.status}): ${url}`);
      const fallback = getMockApiResponse(path);
      if (fallback) {
        console.info(`Using fallback data for ${path}`);
        return fallback as T;
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`API request error for ${url}:`, error instanceof Error ? error.message : error);
    const fallback = getMockApiResponse(path);
    if (fallback) {
      console.info(`Using fallback data for ${path}`);
      return fallback as T;
    }
    return null;
  }
}

export async function fetchAuthedApi<T>(path: string, options?: number | FetchAuthedOptions): Promise<T | null> {
  const { revalidateSeconds, init } = resolveFetchOptions(options);
  const requireAuth = typeof options === "number" ? true : options?.requireAuth ?? true;

  let token: string | null = null;

  try {
    const authState = await auth();
    if (authState && typeof authState.getToken === "function") {
      const template = process.env.CLERK_JWT_TEMPLATE
        || process.env.CLERK_BACKEND_JWT_TEMPLATE
        || process.env.CLERK_API_JWT_TEMPLATE;
      token = await authState.getToken(template ? { template } : {});
    }
  } catch (error) {
    console.warn("Unable to retrieve Clerk token:", error instanceof Error ? error.message : error);
  }

  if (!token && requireAuth) {
    return null;
  }

  const headers = new Headers(init?.headers as HeadersInit | undefined);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const initWithAuth: RequestInit = {
    ...(init ?? {}),
    headers,
  };

  return fetchApi<T>(path, {
    revalidateSeconds,
    init: initWithAuth,
  });
}
