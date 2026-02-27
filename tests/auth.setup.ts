import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('認証情報を保存する', async ({ page }) => {
  const userId = process.env.PLAYWRIGHT_USER_ID;
  const userPassword = process.env.PLAYWRIGHT_USER_PASSWORD;

  if (!userId || !userPassword) {
    throw new Error(
      'PLAYWRIGHT_USER_ID と PLAYWRIGHT_USER_PASSWORD を環境変数で設定してください。',
    );
  }

  await page.goto('/login');

  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(userId);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(userPassword);

  await Promise.all([
    page.waitForURL(/\/$/),
    page.getByRole('button', { name: 'サインイン' }).click(),
  ]);

  await expect(page).toHaveURL('/');
  await page.context().storageState({ path: authFile });
});
