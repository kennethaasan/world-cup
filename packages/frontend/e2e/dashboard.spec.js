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

const viewports = [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 1000 },
    dashboardSnapshot: 'world-cup-2026-dashboard.png',
    drawerSnapshot: 'world-cup-2026-drawer.png',
  },
  {
    name: 'mobile',
    viewport: { width: 390, height: 1200 },
    dashboardSnapshot: 'world-cup-2026-dashboard-mobile.png',
    drawerSnapshot: 'world-cup-2026-drawer-mobile.png',
  },
];

const snapshotOptions = {
  animations: 'disabled',
  fullPage: true,
  maxDiffPixelRatio: 0.1,
};

const screenshotOptions = {
  animations: 'disabled',
  fullPage: true,
};

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-06-15T10:00:00+02:00'));
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

async function expectDashboardData(page) {
  await expect(
    page.getByRole('heading', { name: /Meisterskaps-Tipping 2026/u })
  ).toBeVisible();
  await expect(page.getByText('World Cup 2026')).toBeVisible();
  await expect(page.getByText('USA · Canada · Mexico')).toBeVisible();
  await expect(page.getByText('2026-modus aktivert')).toBeVisible();
  await expect(page.getByText('Anna')).toBeVisible();
  await expect(page.getByText('Bjørn')).toBeVisible();
  await expect(
    page.locator('#resultattabell').getByText('Mexico - Sør-Afrika')
  ).toBeVisible();
  await expect(page.locator('#resultattabell').getByText('2-1')).toBeVisible();
}

async function openParticipantDrawer(page) {
  await page.locator('[role="row"]', { hasText: 'Anna' }).click();

  const drawer = page.getByRole('dialog');

  await expect(drawer.getByRole('heading', { name: 'Anna' })).toBeVisible();
  await expect(
    drawer.getByText('#1 · 8/12 poeng · 4 mulige igjen')
  ).toBeVisible();
  await expect(drawer.getByRole('heading', { name: 'Kamper' })).toBeVisible();
  await expect(drawer.getByText('Svar: 2-1')).toBeVisible();
  await expect(drawer.getByText('Fasit: 2-1')).toBeVisible();
  await expect(drawer.getByText('Hvem vinner finalen?')).toBeVisible();
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} viewport`, () => {
    test.use({ viewport: viewport.viewport });

    test(`renders the World Cup 2026 dashboard with data in ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      await page.goto('/');
      await expectDashboardData(page);

      await expect(page).toHaveScreenshot(viewport.dashboardSnapshot, {
        ...snapshotOptions,
      });

      await page.screenshot({
        ...screenshotOptions,
        path: testInfo.outputPath(viewport.dashboardSnapshot),
      });
    });

    test(`captures the participant drawer with data in ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      await page.goto('/');
      await expectDashboardData(page);
      await openParticipantDrawer(page);

      await expect(page).toHaveScreenshot(viewport.drawerSnapshot, {
        ...snapshotOptions,
      });

      await page.screenshot({
        ...screenshotOptions,
        path: testInfo.outputPath(viewport.drawerSnapshot),
      });
    });
  });
}
