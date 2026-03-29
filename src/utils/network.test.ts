import { fetchJsonWithRetry, fetchJsonWithTimeout } from './network';

describe('network utilities', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('fetchJsonWithTimeout returns parsed JSON on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const result = await fetchJsonWithTimeout<{ ok: boolean }>('https://example.com', 500);

    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it('fetchJsonWithRetry retries network failures and succeeds', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ retries: 1 }),
      } as Response);

    const result = await fetchJsonWithRetry<{ retries: number }>({
      url: 'https://example.com',
      timeoutMs: 500,
      retries: 1,
    });

    expect(result).toEqual({ ok: true, data: { retries: 1 } });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('fetchJsonWithRetry does not retry upstream http errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as Response);

    const result = await fetchJsonWithRetry({
      url: 'https://example.com',
      timeoutMs: 500,
      retries: 2,
    });

    expect(result).toEqual({ ok: false, reason: 'upstream' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
