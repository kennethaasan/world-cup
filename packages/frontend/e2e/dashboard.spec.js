import { expect, test } from '@playwright/test';

const users = [
  {
    id: 'world-cup:user:1',
    name: 'Anna',
    rank: 1,
    points: 8,
    max_points: 12,
    remaining_possible_points: 4,
    questions: [
      {
        question: 'Mexico - Sør-Afrika',
        answer: '2-1',
        blueprint: '2-1',
        points: 2,
        max_points: 2,
        status: 'CORRECT',
        category: 'MATCHES',
      },
      {
        question: 'Hvem vinner finalen?',
        answer: 'Norge',
        blueprint: null,
        points: null,
        max_points: 4,
        status: 'UNSCORED',
        category: 'AWARDS',
      },
    ],
  },
  {
    id: 'world-cup:user:2',
    name: 'Bjørn',
    rank: 2,
    points: 5,
    max_points: 12,
    remaining_possible_points: 4,
    questions: [
      {
        question: 'Mexico - Sør-Afrika',
        answer: '1-1',
        blueprint: '2-1',
        points: 1,
        max_points: 2,
        status: 'PARTIAL',
        category: 'MATCHES',
      },
      {
        question: 'Hvem vinner finalen?',
        answer: 'Brasil',
        blueprint: null,
        points: null,
        max_points: 4,
        status: 'UNSCORED',
        category: 'AWARDS',
      },
    ],
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/graphql', async (route) => {
    const request = route.request().postDataJSON();
    const userId = request.variables?.userId;
    const data =
      request.operationName === 'getUser'
        ? { getUser: users.find((user) => user.id === userId) ?? users[0] }
        : { getUsers: users };

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });
  });
});

test('renders the World Cup 2026 dashboard and captures a UI snapshot', async ({
  page,
}, testInfo) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Meisterskaps-Tipping 2026/u })
  ).toBeVisible();
  await expect(page.getByText('World Cup 2026')).toBeVisible();
  await expect(page.getByText('USA · Canada · Mexico')).toBeVisible();
  await expect(page.getByText('2026-modus aktivert')).toBeVisible();
  await expect(page.getByText('Anna')).toBeVisible();

  await expect(page).toHaveScreenshot('world-cup-2026-dashboard.png', {
    animations: 'disabled',
    maxDiffPixels: 1_440_000,
  });

  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('world-cup-2026-dashboard.png'),
  });
});

test('captures the participant drawer design', async ({ page }, testInfo) => {
  await page.goto('/');

  await page.getByText('Anna').click();

  await expect(page.getByRole('heading', { name: 'Anna' })).toBeVisible();
  await expect(
    page.getByText('#1 · 8/12 poeng · 4 mulige igjen')
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kamper' })).toBeVisible();

  await expect(page).toHaveScreenshot('world-cup-2026-drawer.png', {
    animations: 'disabled',
    maxDiffPixels: 1_440_000,
  });

  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('world-cup-2026-drawer.png'),
  });
});
