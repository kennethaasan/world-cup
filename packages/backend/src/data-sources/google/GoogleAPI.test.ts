import { afterEach, describe, expect, test, vi } from 'vitest';
import { buildUsersFromGoogleSheetsData } from './GoogleAPI';

const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  globalThis.fetch = originalFetch;
});

describe('buildUsersFromGoogleSheetsData', () => {
  test('adds ranks, possible points and question statuses', () => {
    const users = buildUsersFromGoogleSheetsData([
      [
        'Timestamp',
        'Email',
        'Name',
        'Mexico - Sør-Afrika',
        'Vinner',
        'Toppscorer etter gruppespill',
      ],
      ['2026-01-01', 'a@example.com', 'Anna', '2-1', 'Frankrike', 'Håland'],
      ['2026-01-01', 'b@example.com', 'Bjørn', '1-1', 'Brasil', 'Mbappe'],
      ['fasit', '', '', '2-1', 'Frankrike', ''],
    ]);

    expect(users?.map((user) => user.name)).toEqual(['Anna', 'Bjørn']);
    expect(users?.map((user) => user.rank)).toEqual([1, 2]);
    expect(users?.map((user) => user.points)).toEqual([12, 0]);
    expect(users?.map((user) => user.maxPoints)).toEqual([15, 15]);
    expect(users?.map((user) => user.remainingPossiblePoints)).toEqual([3, 3]);
    expect(users?.[0].questions?.map((question) => question.status)).toEqual([
      'CORRECT',
      'CORRECT',
      'UNSCORED',
    ]);
    expect(users?.[1].questions?.map((question) => question.status)).toEqual([
      'WRONG',
      'WRONG',
      'UNSCORED',
    ]);
  });

  test('uses shared ranks for equal scores', () => {
    const users = buildUsersFromGoogleSheetsData([
      ['Timestamp', 'Email', 'Name', 'Mexico - Sør-Afrika'],
      ['2026-01-01', 'a@example.com', 'Anna', '2-1'],
      ['2026-01-01', 'b@example.com', 'Bjørn', '2-1'],
      ['2026-01-01', 'c@example.com', 'Carla', '0-0'],
      ['fasit', '', '', '2-1'],
    ]);

    expect(
      users?.map((user) => ({ name: user.name, rank: user.rank }))
    ).toEqual([
      { name: 'Anna', rank: 1 },
      { name: 'Bjørn', rank: 1 },
      { name: 'Carla', rank: 3 },
    ]);
  });

  test('fetches Google Sheets in production when an API key is configured', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GOOGLE_API_KEY', 'test-api-key');
    vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', '');
    vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', '');
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', '');
    vi.stubEnv('GOOGLE_OAUTH_REFRESH_TOKEN', '');
    vi.stubEnv('GOOGLE_SHEETS_ID', 'sheet-id');
    vi.stubEnv('GOOGLE_SHEETS_RANGE', "'Form Responses 1'!A1:D4");

    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            values: [
              ['Timestamp', 'Email', 'Name', 'Mexico - Sør-Afrika'],
              ['2026-01-01', 'a@example.com', 'Anna', '2-1'],
              ['fasit', '', '', '2-1'],
            ],
          }),
        ok: true,
      } as Response)
    );
    globalThis.fetch = fetchMock;

    const { GoogleAPI } = await import('./GoogleAPI');
    const users = await new GoogleAPI().getUsers();

    expect(users?.[0].name).toBe('Anna');
    expect(fetchMock).toHaveBeenCalledOnce();
    const requestUrl = fetchMock.mock.calls[0][0];
    expect(requestUrl).toBeTypeOf('string');
    if (typeof requestUrl !== 'string') {
      throw new Error('Expected Google Sheets request URL to be a string');
    }
    expect(requestUrl).toContain('key=test-api-key');
  });
});
