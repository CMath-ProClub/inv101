const DEFAULT_API_BASE = 'http://localhost:4000';

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || DEFAULT_API_BASE;
}

export async function fetchApi<T>(path: string, revalidateSeconds = 120): Promise<T | null> {
  const base = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path}`;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: revalidateSeconds }
    });

    if (!response.ok) {
      console.warn(`API request failed (${response.status}): ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`API request error for ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
}
