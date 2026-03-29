export type FetchJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'network' | 'timeout' | 'upstream' };

export async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs: number,
): Promise<FetchJsonResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return { ok: false, reason: 'upstream' };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }

    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJsonWithRetry<T>(params: {
  url: string;
  timeoutMs?: number;
  retries?: number;
}): Promise<FetchJsonResult<T>> {
  const { url, timeoutMs = 4500, retries = 1 } = params;

  let attempt = 0;
  let lastResult: FetchJsonResult<T> | null = null;

  while (attempt <= retries) {
    const result = await fetchJsonWithTimeout<T>(url, timeoutMs);
    if (result.ok) {
      return result;
    }

    lastResult = result;
    if (result.reason === 'upstream') {
      return result;
    }

    attempt += 1;
  }

  if (!lastResult) {
    return { ok: false, reason: 'network' };
  }

  return lastResult.reason === 'timeout'
    ? { ok: false, reason: 'timeout' }
    : { ok: false, reason: 'network' };
}
