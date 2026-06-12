import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const generatedFile = resolve(currentDirectory, '../src/generated/queries.ts');

let contents = readFileSync(generatedFile, 'utf8');

const seenEnumAliases = new Set();
contents = contents.replace(
  /export type (QuestionCategory|QuestionStatus) =[\s\S]*?;\n\n/g,
  (match, name) => {
    if (seenEnumAliases.has(name)) {
      return '';
    }

    seenEnumAliases.add(name);
    return match;
  }
);

contents = contents.replace(
  /\/\/ @ts-ignore\nexport function use\w+SuspenseQuery[\s\S]*?export type \w+SuspenseQueryHookResult = ReturnType<[\s\S]*?>;\n/g,
  ''
);

writeFileSync(generatedFile, contents);
