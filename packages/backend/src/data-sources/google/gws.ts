import { execFile } from 'node:child_process';

export async function getGoogleSheetsDataFromGws({
  range,
  spreadsheetId,
}: {
  range: string;
  spreadsheetId: string;
}): Promise<string[][]> {
  const stdout = await new Promise<string>((resolve, reject) => {
    execFile(
      'gws',
      [
        'sheets',
        'spreadsheets',
        'values',
        'get',
        '--params',
        JSON.stringify({
          range,
          spreadsheetId,
          valueRenderOption: 'FORMATTED_VALUE',
        }),
      ],
      (error, output) => {
        if (error) {
          reject(
            error instanceof Error ? error : new Error('gws command failed')
          );
          return;
        }

        resolve(output);
      }
    );
  });
  const data = JSON.parse(stdout) as {
    values?: string[][];
  };

  return data.values || [];
}
