import crypto from 'crypto';
import { Question, User } from '../../models';
import { getOptionalEnvVar } from '../../utils/env';
import { getPoints } from './points';

const GOOGLE_API_KEY = getOptionalEnvVar('GOOGLE_API_KEY');
const GOOGLE_SERVICE_ACCOUNT_EMAIL = getOptionalEnvVar(
  'GOOGLE_SERVICE_ACCOUNT_EMAIL'
);
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = getOptionalEnvVar(
  'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'
);
const GOOGLE_OAUTH_CLIENT_ID = getOptionalEnvVar('GOOGLE_OAUTH_CLIENT_ID');
const GOOGLE_OAUTH_CLIENT_SECRET = getOptionalEnvVar(
  'GOOGLE_OAUTH_CLIENT_SECRET'
);
const GOOGLE_OAUTH_REFRESH_TOKEN = getOptionalEnvVar(
  'GOOGLE_OAUTH_REFRESH_TOKEN'
);
const GOOGLE_SHEETS_ID =
  getOptionalEnvVar('GOOGLE_SHEETS_ID') ||
  '1hsMSMhqu4UTrPlToYrfxjFrIXmT2JaiVzzjXeUvbgpw';
const GOOGLE_SHEETS_RANGE =
  getOptionalEnvVar('GOOGLE_SHEETS_RANGE') || "'Form Responses 1'!A1:CS125";

let cachedToken:
  | {
      accessToken: string;
      expiresAt: number;
    }
  | undefined;

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, '\n');
}

function base64Url(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getServiceAccountAccessToken(): Promise<string | undefined> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return undefined;
  }

  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.accessToken;
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const claimSet = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(claimSet)
  )}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(normalizePrivateKey(GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY), 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const assertion = `${unsignedToken}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google service account auth failed: ${response.status}`);
  }

  const token = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in,
  };

  return cachedToken.accessToken;
}

async function getOAuthAccessToken(): Promise<string | undefined> {
  if (
    !GOOGLE_OAUTH_CLIENT_ID ||
    !GOOGLE_OAUTH_CLIENT_SECRET ||
    !GOOGLE_OAUTH_REFRESH_TOKEN
  ) {
    return undefined;
  }

  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.accessToken;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google OAuth refresh failed: ${response.status}`);
  }

  const token = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in,
  };

  return cachedToken.accessToken;
}

async function getGoogleAccessToken(): Promise<string | undefined> {
  return (await getServiceAccountAccessToken()) || getOAuthAccessToken();
}

function normalizeMarker(value: string | undefined): string {
  return (value || '').trim().toLowerCase();
}

function isBlueprintRow(row: string[]): boolean {
  return row.slice(0, 3).some((cell) => {
    const marker = normalizeMarker(cell);
    return marker === 'fasit' || marker === 'blueprint';
  });
}

function splitRowsAndBlueprint(rows: string[][]): {
  rows: string[][];
  blueprints: string[];
} {
  for (let index = rows.length - 1; index >= 0; index = index - 1) {
    if (isBlueprintRow(rows[index])) {
      return {
        rows: [...rows.slice(0, index), ...rows.slice(index + 1)],
        blueprints: rows[index],
      };
    }
  }

  return {
    rows,
    blueprints: [],
  };
}

export class GoogleAPI {
  private async getGoogleSheetsData(): Promise<string[][]> {
    const searchParams = new URLSearchParams();
    const accessToken = await getGoogleAccessToken();

    if (accessToken) {
      searchParams.set('valueRenderOption', 'FORMATTED_VALUE');
    } else if (GOOGLE_API_KEY) {
      searchParams.set('key', GOOGLE_API_KEY);
      searchParams.set('valueRenderOption', 'FORMATTED_VALUE');
    } else {
      throw new Error(
        'GOOGLE_API_KEY, Google service account credentials, or Google OAuth refresh credentials are required'
      );
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${encodeURIComponent(
        GOOGLE_SHEETS_RANGE
      )}?${searchParams.toString()}`,
      {
        headers: accessToken
          ? {
              authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      }
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      values: string[][];
    };

    return data.values || [];
  }

  public async getUsers(): Promise<User[] | undefined> {
    const googleSheetsData = await this.getGoogleSheetsData();

    const [headers = [], ...sheetRows] = googleSheetsData;

    const { rows, blueprints } = splitRowsAndBlueprint(sheetRows);

    return rows
      .filter((user) => user.some((cell) => cell.trim() !== ''))
      .map((user, userId) => {
        const [timestamp = '', email = '', name = '', ...rest] = user;

        let points = 0;

        const questions = headers.slice(3).map((question, index) => {
          const answer = rest[index] || '';
          const blueprint = blueprints[index + 3];

          const questionPoints = getPoints(question, answer, blueprint);

          if (questionPoints) {
            points = points + questionPoints.points;
          }

          return new Question({
            question,
            answer,
            blueprint: blueprint === '' ? undefined : blueprint,
            points: questionPoints?.points,
            maxPoints: questionPoints?.maxPoints,
          });
        });

        return new User({
          id: `world-cup:user:${userId + 1}`,
          name: name || email || `Deltaker ${userId + 1}`,
          email,
          timestamp,
          points,
          questions,
        });
      })
      .sort((a, b) => {
        if (a.points === b.points) {
          return a.name.localeCompare(b.name);
        } else if (a.points > b.points) {
          return -1;
        } else if (a.points < b.points) {
          return 1;
        }
        return 0;
      });
  }

  public async getUser(args: { userId: string }): Promise<User | undefined> {
    const users = await this.getUsers();
    return users?.find((user) => user.id === args.userId);
  }
}
