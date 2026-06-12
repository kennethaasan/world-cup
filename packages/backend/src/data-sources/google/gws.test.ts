import { execFile } from 'node:child_process';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getGoogleSheetsDataFromGws } from './gws';

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
}));

type ExecFileCallback = (
  error: Error | null,
  stdout: string,
  stderr: string
) => void;

type GwsExecFileMock = {
  mockReset: () => void;
  mockImplementation: (
    implementation: (
      command: string,
      args: string[],
      callback: ExecFileCallback
    ) => undefined
  ) => void;
};

const execFileMock = vi.mocked(execFile) as unknown as GwsExecFileMock;

describe('getGoogleSheetsDataFromGws', () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  test('reads Google Sheets values through the gws CLI', async () => {
    execFileMock.mockImplementation((command, args, callback) => {
      expect(command).toBe('gws');
      expect(args).toContain('--params');
      callback(
        null,
        JSON.stringify({
          values: [
            ['Timestamp', 'Email', 'Navn'],
            ['2026-06-01', 'anna@example.com', 'Anna'],
          ],
        }),
        ''
      );

      return undefined;
    });

    await expect(
      getGoogleSheetsDataFromGws({
        range: "'Form Responses 1'!A1:C2",
        spreadsheetId: 'sheet-id',
      })
    ).resolves.toEqual([
      ['Timestamp', 'Email', 'Navn'],
      ['2026-06-01', 'anna@example.com', 'Anna'],
    ]);
    expect(execFileMock).toHaveBeenCalledWith(
      'gws',
      [
        'sheets',
        'spreadsheets',
        'values',
        'get',
        '--params',
        JSON.stringify({
          range: "'Form Responses 1'!A1:C2",
          spreadsheetId: 'sheet-id',
          valueRenderOption: 'FORMATTED_VALUE',
        }),
      ],
      expect.any(Function)
    );
  });
});
